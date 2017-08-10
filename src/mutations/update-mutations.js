import * as MutationTypes from '../mutation-types'
import TrannsmissionStatus from '../models/transmission-types'

const UpdateMutations = {
  [MutationTypes.ADD_UPDATE] (state, update) {
    const updateIndex = state.updates.indexOf(update)
    if (updateIndex < 0) {
      state.updates.push(update)
    } else {
      state.updates.splice(updateIndex,1,update)
    }
  },
  [MutationTypes.MODIFY_UPDATE] (state, update) {
    const updateIndex = state.updates.indexOf(update)
    if (updateIndex >= 0) {
      state.updates.splice(updateIndex,1,update)
    }
  },
  [MutationTypes.REMOVE_UPDATE] (state, update) {
    /** Find all Transfers for an update **/
    let transfersToRemove = state.transfers.filter(transfer => transfer.update === update )
    /** Find all objects for Transfers**/
    let objectsToRemove = state.objects.filter(object => transfersToRemove.includes(object.transfer))
    /** Find all writes for a TransferObjects**/
    let writesToRemove =  state.writes.filter(write => objectsToRemove.includes(write.transferObject))
    for(var write of writesToRemove) {
      let writeIndex = state.writes.indexOf(write)
      if(writeIndex >= 0) {
        state.writes.splice(writeIndex,1)
      }
    }
    for(var object of objectsToRemove) {
      let objectIndex = state.objects.indexOf(object)
      if(objectIndex >= 0) {
        state.objects.splice(objectIndex,1)
      }
    }
    for(var transfer of transfersToRemove) {
      var transferIndex = state.transfers.indexOf(transfer)
      if (transferIndex >= 0) {
        state.transfers.splice(transferIndex,1)
      }
    }
    /** Finally remove the update**/
    let  updateIndex = state.updates.indexOf(update)
    if (updateIndex >= 0) {
      state.updates.splice(updateIndex,1)
    }
  }
}

export default UpdateMutations
