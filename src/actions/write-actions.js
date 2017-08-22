import * as MutationTypes from './../mutation-types'
import TransmissionStatus from './../models/transmission-types'
import Write from '../models/write'

const WriteActions = {

  async addDeviceFirmwareUpgradeCommand({ dispatch, commit }, write) {
    if(write instanceof Write.Write && !(write instanceof Write.Package)) {
      commit(MutationTypes.ADD_WRITE, write)
    }
  },

  async removeDeviceFirmwareUpgradeWrite({ dispatch, commit }, write) {
    if(write instanceof Write.Write) {
      commit(MutationTypes.REMOVE_WRITE, write)
    }
  },

  async addDeviceFirmwareUpgradePacket({ dispatch, commit }, write) {
    if(write instanceof Write.Package) {
      commit(MutationTypes.ADD_WRITE, write)
    }
  },

  async performDeviceFirmwareUpgradeCommand ({ dispatch, commit }, write) {
    if(write instanceof Write.Write && (write instanceof Write.Package) === false) {
      write.state = TransmissionStatus.Transfering
      commit(MutationTypes.UPDATE_WRITE, write)
      var attempts = 3;
      do {
        try {
          await write.characteristic.writeValue(write.bytes)
          write.error = undefined
          write.state = TransmissionStatus.Completed
          attempts = 0
          commit(MutationTypes.UPDATE_WRITE, write)
        } catch (err) {
          attempts--
          write.error = err
          write.state = TransmissionStatus.Failed
          if(attempts === 0) commit(MutationTypes.UPDATE_WRITE, write)
        }
      } while (attempts > 0);
    }
  },

  async performDeviceFirmwareUpgradePackagesForObject ({ dispatch, commit, state }, transferObject) {
    let writes = state.writes.filter(write => {
      return (write instanceof Write.Package) && write.transferObject === transferObject && write.state === TransmissionStatus.Prepared
    })
    for(let write of writes) {
      write.state = TransmissionStatus.Transfering
      commit(MutationTypes.UPDATE_WRITE, write)
      var attempts = 3;
      do {
        try {
          await write.characteristic.writeValue(write.bytes)
          write.error = undefined
          write.state = TransmissionStatus.Completed
          attempts = 0
        } catch (err) {
          attempts--
          write.error = err
          write.state = TransmissionStatus.Failed
        }
      } while (attempts > 0);
      commit(MutationTypes.UPDATE_WRITE, write)
      if(write.error) break
    }
  },

  async webBluetoothScheduleNextDeviceFirmwareUpgradeCommand({ dispatch, commit, state }, payload) {
    let nextWrite = state.writes.find(writeRecord => {
      return writeRecord.state === TransmissionStatus.Transfering || writeRecord.state === TransmissionStatus.Prepared || (writeRecord instanceof Write.Package) === false
    })
    if (nextWrite && nextWrite.state === TransmissionStatus.Prepared) {
      dispatch('webBluetoothPerformDeviceFirmwareUpgradeCommand', nextWrite)
    }
  }
}

export default WriteActions
