import * as MutationTypes from '../mutation-types'

const WriteMutations = {
  [MutationTypes.ADD_WRITE] (state, payload) {
    const deviceIndex = state.devices.indexOf(payload.device)
    if (deviceIndex < 0) {
      state.devices.push(payload.device)
    } else {
      state.devices.splice(deviceIndex,1,payload.device)
    }
  },
  [MutationTypes.UPDATE_WRITE] (state, payload) {
    const deviceIndex = state.devices.indexOf(payload.device)
    state.devices.splice(deviceIndex, 1)
  },
  [MutationTypes.REMOVE_WRITE] (state, payload) {
    const deviceIndex = state.devices.indexOf(payload.device)
    if (deviceIndex < 0) {
      state.devices.push(payload.device)
    } else {
      state.devices.splice(deviceIndex,1,payload.device)
    }
  }
}

export default WriteMutations
