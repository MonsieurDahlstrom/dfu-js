import {Update, UpdateStates} from '../models/update'
import {Firmware} from '../models/firmware'
import Transfer from '../models/transfer'
import {TransferObjectType} from '../models/transfer-object'
import * as MutationTypes from '../mutation-types'

// DFU by Nordic Semiconductor
const DFU_BASE = '0000xxxx-0000-1000-8000-00805f9b34fb'
export const DFUSecure = DFU_BASE.replace('xxxx', 'fe59')
const DFU_CHAR_BASE = '8ec9xxxx-f315-4f60-9fb8-838830daea50'
// Control Point is notify, write
export const DFUSecureControlPoint = DFU_CHAR_BASE.replace('xxxx', '0001')
// Packet is Write No Response
export const DFUSecurePacket = DFU_CHAR_BASE.replace('xxxx', '0002')

const DFUCharacteristicsForDevice = async function (device) {
  let service = await device.gatt.getPrimaryService(DFUSecure)
  let packetPoint = await service.getCharacteristic(DFUSecurePacket)
  let controlPoint = await service.getCharacteristic(DFUSecureControlPoint)
  return {identifier: device.id, packetPoint: packetPoint, controlPoint: controlPoint}
}

const UpdateActions = {

  async webBluetoothDFUCreateUpdate({ dispatch, commit }, bluetoothDevice) {
    let metadata = await DFUCharacteristicsForDevice(bluetoothDevice)
    let update = new Update(metadata.identifier, metadata.controlPoint, metadata.packetPoint)
    commit(MutationTypes.ADD_UPDATE, update)
  },

  async webBluetoothDFURemoveUpdate({ dispatch, commit }, update) {
    commit(MutationTypes.REMOVE_UPDATE, update)
  },

  async webBluetoothDFUCancelUpdate({ dispatch, commit }, update) {
    update.state = UpdateStates.FAILED
    commit(MutationTypes.MODIFED_UPDATE, update)
  },

  async webBluetoothDFURestoreUpdate({ dispatch, commit }, payload) {
    let metadata = await DFUCharacteristicsForDevice(payload.bluetoothDevice)
    payload.update.setControlPoint(metadata.controlPoint)
    payload.update.setPacketPoint(metadata.packetPoint)
    payload.update.setDeviceIdentifier(payload.bluetoothDevice.id)
    commit(MutationTypes.MODIFED_UPDATE, payload.update)
  },

  /**
    Send a firmware to a device. Throws when parameter or state is invalid for sending a firmware
  **/
  async webBluetoothDFUSendFirmware({ dispatch, commit }, payload) {
    let firmware = payload.firmware
    let update = payload.update
    if (firmware instanceof Firmware && update instanceof Update) {
      if (update.state === UpdateStates.IDLE) {
        for(var section of firmware.sections) {
          update.transfers.push(new Transfer(section.dat, this.controlpointCharacteristic, this.packetCharacteristic, TransferObjectType.Command))
          update.transfers[update.transfers.length-1].update = update
          dispatch('webBluetoothDFUTransferAdd', update.transfers[update.transfers.length-1])
          update.transfers.push(new Transfer(section.bin, this.controlpointCharacteristic, this.packetCharacteristic, TransferObjectType.Data))
          update.transfers[update.transfers.length-1].update = update
          dispatch('webBluetoothDFUTransferAdd', update.transfers[update.transfers.length-1])
        }
        commit(MutationTypes.MODIFED_UPDATE, update)
      }
    }
  }
}

export default UpdateActions
