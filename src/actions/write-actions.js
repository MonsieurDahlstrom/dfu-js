import * as MutationTypes from './../mutation-types'
import WriteTypes from './../types/write-types'
import TransmissionStatus from './../types/transmission-types'
import {Write} from './../types/write'

const WriteActions = {

  async webBluetoothDFUScheduleWrite({ dispatch, commit }, write) {
    if(write instanceof Write) {
      commit(MutationTypes.ADD_WRITE, write)
    }
  },

  async webBluetoothDFUWriteRemove ({ dispatch, commit }, action) {
    commit(MutationTypes.REMOVE_WRITE, action)
  },

  async webBluetoothDFUExecuteWrite ({ dispatch, commit }, action) {
    var attempts = 3;
    do {
      try {
        await action.characteristic.writeValue(action.buffer)
        action.state = TransmissionStatus.Completed
      } catch (err) {
        action.error = err
        action.state = TransmissionStatus.Failed
      }
    } while (attempts > 0 || action.state === TransmissionStatus.Completed);
    commit(MutationTypes.UPDATE_WRITE, action)
  }
}

export default WriteActions
