import * as MutationTypes from '../mutation-types'

const WriteMutations = {
  [MutationTypes.ADD_WRITE] (state, write) {
    const writeIndex = state.writes.indexOf(write)
    if (writeIndex < 0) {
      state.writes.push(write)
    } else {
      state.writes.splice(writeIndex,1,write)
    }
  },
  [MutationTypes.UPDATE_WRITE] (state, write) {
    const writeIndex = state.writes.indexOf(write)
    if (writeIndex >= 0) {
      state.writes.splice(writeIndex,1,write)
    }
  },
  [MutationTypes.REMOVE_WRITE] (state, write) {
    const writeIndex = state.writes.indexOf(write)
    if (writeIndex >= 0) {
      state.writes.splice(writeIndex,1)
    }
  }
}

export default WriteMutations
