import * as MutationTypes from './../mutation-types'
import TransmissionStatus from './../models/transmission-types'
import Write from '../models/write'

const WriteActions = {

  async webBluetoothDFUScheduleWrite({ dispatch, commit }, write) {
    if(write instanceof Write.Write) {
      commit(MutationTypes.ADD_WRITE, write)
    }
  },

  async webBluetoothDFUWriteRemove ({ dispatch, commit }, write) {
    if(write instanceof Write.Write) {
      commit(MutationTypes.REMOVE_WRITE, write)
    }
  },

  async webBluetoothDFUExecuteWrite ({ dispatch, commit }, write) {
    if(write instanceof Write.Write) {
      var attempts = 3;
      do {
        try {
          await write.characteristic.writeValue(write.buffer)
          attempts = 0
          write.state = TransmissionStatus.Completed
        } catch (err) {
          attempts--
          write.error = err
          write.state = TransmissionStatus.Failed
        }
      } while (attempts > 0);
      commit(MutationTypes.UPDATE_WRITE, write)
    }
  }
}

export default WriteActions
