import Write from '../models/write'
import * as MutationTypes from '../mutation-types'
import TransmissionStatus from '../models/transmission-types'
import {TransferObject} from '../models/transfer-object'

const TransferActions = {

  async webBluetoothDFUTransferAdd({ dispatch, commit }, transfer) {
    commit(MutationTypes.ADD_TRANSFER, transfer)
  },

  /** Clean up event registrations when transfer is completed **/
  async webBluetoothDFUTransferUpdated({ dispatch, commit }, transfer) {
    commit(MutationTypes.UPDATE_TRANSFER, transfer)
  },

  /** Clean up event registrations when transfer is completed **/
  async webBluetoothDFUTransferRemove({ dispatch, commit }, transfer) {
    commit(MutationTypes.REMOVE_TRANSFER, transfer)
  }

}

export default TransferActions

/** Begin the tranfer of a file by asking the NRF51/52 for meta data and verify if the file has been transfered already
async webBluetoothDFUTransferBegin({ dispatch, commit }, transfer) {
  let write = new Write.Verify(transfer.controlPoint, transfer.objectType)
  await dispatch('webBluetoothDFUScheduleWrite', write)
  dispatch('webBluetoothDFUExecuteWrite', write)
  commit(MutationTypes.UPDATE_TRANSFER, transfer)
},
**/
/** Checks if Transfer is complete or starts transferring the next TransferObject
async webBluetoothDFUTransferNextObject({ dispatch, commit }, transfer) {
  console.log('webBluetoothDFUTransferNextObject')
  if (transfer.currentObjectIndex < transfer.objects.length - 1) {
    transfer.currentObjectIndex++
    dispatch('webBluetoothDFUObjectBegin', transfer.objects[transfer.currentObjectIndex])
  } else {
    transfer.state = TransmissionStatus.Completed
  }
  commit(MutationTypes.UPDATE_TRANSFER, transfer)
},
**/
