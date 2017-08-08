import {Verify} from '../types/write'
import TransmissionStatus from '../types/transmission-types'

const GenerateObjects = function (dispatch, transfer) {
  let fileBegin = 0
  let fileEnd = transfer.file.length
  let index = fileBegin
  while (index < fileEnd) {
    let objectBegin = index
    let objectEnd = objectBegin + transfer.maxObjectLength < fileEnd ? transfer.maxObjectLength : (fileEnd - index)
    let object = new TransferObject(objectBegin, objectEnd, transfer, transfer.objectType)
    object.transfer = transfer
    transfer.objects.push(object)
    dispatch('webBluetoothDFUObjectAdd', object)
    index += transfer.maxObjectLength
  }
}

const TransferActions = {

  async webBluetoothDFUTransferAdd({ dispatch, commit }, transfer) {
    transfer.controlPointEventHandler = function(event) {
      dispatch('webBluetoothDFUTransferEventHandler', {transfer: transfer, dataView: event.target.value})
    }
    transfer.controlPoint.addEventListener('characteristicvaluechanged', transfer.controlPointEventHandler)
    commit(MutationTypes.ADD_TRANSFER, transfer)
  },

  /** Clean up event registrations when transfer is completed **/
  async webBluetoothDFUTransferRemove({ dispatch, commit }, transfer) {
    transfer.controlPoint.removeEventListener('characteristicvaluechanged', transfer.controlPointEventHandler)
    commit(MutationTypes.REMOVE_TRANSFER, transfer)
  },

  /** Begin the tranfer of a file by asking the NRF51/52 for meta data and verify if the file has been transfered already **/
  async webBluetoothDFUTransferBegin({ dispatch, commit }, transfer) {
    let write = new Verify(this.controlPoint, this.objectType)
    dispatch('webBluetoothDFUScheduleWrite', write)
    dispatch('webBluetoothDFUExecuteWrite', write)
    commit(MutationTypes.UPDATE_TRANSFER, transfer)
  },

  /**
  Given the type of device and object type, the maxium size that can be processed
  at a time varies. This method creates a set of TransferObject with this maxium size
  set.

  Secondly the device reports back how much of the file has been transfered and what the crc
  so far is. This method skips object that has already been completed
  **/
  async webBluetoothDFUTransferPrepare({ dispatch, commit }, payload) {
    let transfer = payload.transfer
    let maxiumSize = payload.maxiumSize
    let currentOffset = payload.offset
    let currentCRC = payload.checksum
    //
    transfer.maxObjectLength = maxiumSize
    transfer.objects = []
    transfer.currentObjectIndex = 0
    GenerateObjects(dispatch, transfer)
    /** Skip to object for the offset **/
    let object = transfer.objects.find((item) => item.hasOffset(currentOffset))
    if (object) {
      transfer.currentObjectIndex = transfer.objects.indexOf(object)
    }
    transfer.state = TransmissionStatus.Transfering
    dispatch('webBluetoothDFUObjectValidate', {checksum: currentCRC, offset: currentOffset, transferObject: transfer.objects[transfer.currentObjectIndex]})
    commit(MutationTypes.UPDATE_TRANSFER, transfer)
  },

  /** Checks if Transfer is complete or starts transferring the next TransferObject **/
  async webBluetoothDFUTransferNextObject({ dispatch, commit }, transfer) {
    if (transfer.currentObjectIndex < transfer.objects.length - 1) {
      transfer.currentObjectIndex++
      dispatch('webBluetoothDFUObjectBegin',transfer.objects[this.currentObjectIndex])
    } else {
      transfer.state = TransmissionStatus.Completed
    }
    commit(MutationTypes.UPDATE_TRANSFER, transfer)
  },

  /** handles events received on the Control Point Characteristic **/
  async webBluetoothDFUTransferEventHandler({ dispatch, commit }, payload) {

    /** guard to filter events that are not response codes  */
    let dataView = payload.dataView
    let transfer = payload.transfer
    switch (transfer.state) {
      case TransmissionStatus.Prepare: {
        let opCode = dataView.getInt8(1)
        let responseCode = dataView.getInt8(2)
        if (opCode === TaskType.SELECT && responseCode === TaskResult.SUCCESS) {
          dispatch('webBluetoothDFUTransferPrepare', {checksum: dataView.getUint32(11, true), offset:  dataView.getUint32(7, true), maxiumSize: dataView.getUint32(3, true), transfer: transfer})
        }
        break
      }
      default: {
        var transferObject = transfer.objects[transfer.currentObjectIndex]
        if(transferObject) {
          dispatch('webBluetoothDFUObjectHandleEvent', {dataView: dataView, transferObject: transferObject})
        } else {
          console.error('Transfer.onEvent called with no objects or no current object')
        }
        break
      }
    }
  }

}

export default TransferActions
