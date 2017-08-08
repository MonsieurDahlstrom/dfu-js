import * as MutationTypes from '../mutation-types'
import TrannsmissionStatus from '../types/transmission-types'

const TransferMutations = {
  [MutationTypes.ADD_TRANSFER] (state, transfer) {
    const transferIndex = state.transfers.indexOf(transfer)
    if (transferIndex < 0) {
      state.transfers.push(transfer)
    } else {
      state.transfers.splice(transferIndex,1,transfer)
    }
  },
  [MutationTypes.UPDATE_TRANSFER] (state, transfer) {
    const transferIndex = state.transfers.indexOf(transfer)
    if (transferIndex >= 0) {
      state.transfers.splice(transferIndex,1,transfer)
    }
  },
  [MutationTypes.REMOVE_TRANSFER] (state, transfer) {
    /** Find all objects for Transfer**/
    let objectsToRemove = state.objects.filter((object) => object.transfer === transfer)
    for(var object of objectsToRemove) {
      /** Find all writes for a TransferObject**/
      let writesToRemove = state.writes.filter((write) => write.transferObject === object)
      for(var write of writesToRemove) {
        let writeIndex = state.writes.indexOf(write)
        if(writeIndex >= 0) {
          state.writes.splice(writeIndex,1)
        }
      }
      /** Remove object after write **/
      let objectIndex = state.objects.indexOf(object)
      if(objectIndex >= 0) {
        state.objects.splice(objectIndex,1)
      }
    }
    /** Finally remove the transfer**/
    let  transferIndex = state.transfers.indexOf(transfer)
    if (transferIndex >= 0) {
      state.transfers.splice(transferIndex,1)
    }
  }
}

export default TransferMutations
