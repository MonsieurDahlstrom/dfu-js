import * as MutationTypes from '../mutation-types'
import TrannsmissionStatus from '../models/transmission-types'

const TransferObjectMutations = {
  [MutationTypes.ADD_TRANSFER_OBJECT] (state, transferObject) {
    const objectIndex = state.objects.indexOf(transferObject)
    if (objectIndex < 0) {
      state.objects.push(transferObject)
    } else {
      state.objects.splice(objectIndex,1,transferObject)
    }
  },
  [MutationTypes.UPDATE_TRANSFER_OBJECT] (state, transferObject) {
    const objectIndex = state.objects.indexOf(transferObject)
    if (objectIndex >= 0) {
      state.objects.splice(objectIndex,1,transferObject)
    }
  },
  [MutationTypes.REMOVE_TRANSFER_OBJECT] (state, transferObject) {
    let writesToRemove = state.writes.filter((write) => write.transferObject === transferObject)
    for(var write of writesToRemove) {
      var writeIndex = state.writes.indexOf(write)
      if(writeIndex >= 0) {
        state.writes.splice(writeIndex,1)
      }
    }
    const objectIndex = state.objects.indexOf(transferObject)
    if (objectIndex >= 0) {
      state.objects.splice(objectIndex,1)
    }
  }
}

export default TransferObjectMutations
