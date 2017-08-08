import crc from 'crc'
//
import * as Writes from '../types/write'
import WriteTypes from '../types/write-types'
import WriteResponses from '../types/write-responses'
//
import * as MutationTypes from '../mutation-types'
import {TransferObjectState} from '../types/transfer-object'

const DATA_CHUNK_SIZE = 20

const TransferObjectActions = {

  /** Adding a TransferObject to the vuex state **/
  async webBluetoothDFUObjectAdd({ dispatch, commit }, transferObject) {
    commit(MutationTypes.ADD_TRANSFER_OBJECT, transferObject)
  },

  /* Remove a TransferObject from the vuex state */
  async webBluetoothDFUObjectRemove({ dispatch, commit }, transferObject) {
    commit(MutationTypes.REMOVE_TRANSFER_OBJECT, transferObject)
  },

  /** The first step in transferring this object, ask how much has already been transferred **/
  async webBluetoothDFUObjectBegin({ dispatch, commit }, transferObject) {
    transferObject.state = TransferObjectState.Creating
    let write = new Writes.Verify(transferObject.type,transferObject.transfer.controlPoint)
    write.transferObject = transferObject
    dispatch('webBluetoothDFUScheduleWrite',write)
    dispatch('webBluetoothDFUExecuteWrite', write)
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
  },

  /**
    Internal convinence methods, a transfer object might have been partially
    transfered already, if so the offset passed in as none zero.

    Based on the offset and length into the Transfer objects file and the given
    offset in this range, create the number of chunks needed.
  **/
  async webBluetoothDFUObjectToPackets({ dispatch, commit }, payload) {
    let transferObject = payload.transferObject
    let offset = payload.offset
    let parentFileEnd = transferObject.offset + transferObject.length
    let parentFileBegin = transferObject.offset + offset
    let index = parentFileBegin
    while (index < parentFileEnd) {
      let chunkBegin = index
      let chunkEnd = chunkBegin + DATA_CHUNK_SIZE < parentFileEnd ? chunkBegin + DATA_CHUNK_SIZE : chunkBegin + (parentFileEnd - index)
      let chunk = transferObject.transfer.file.slice(chunkBegin, chunkEnd)
      transferObject.chunks.push(chunk)
      index += DATA_CHUNK_SIZE
    }
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
  },

  /** Slots all data chunks for transmission, the queue inside Transfer ensures the order **/
  async webBluetoothDFUObjectTransferDataPackages({ dispatch, commit }, transferObject) {
    let writes = []
    for (let index = 0; index < transferObject.chunks.length; index++) {
      let buffer = transferObject.chunks[index]
      let write = new Writes.Package(buffer,transferObject.transfer.packetPoint)
      write.transferObject = transferObject
      writes.push(write)
      dispatch('webBluetoothDFUScheduleWrite', write)
    }
    dispatch('webBluetoothDFUExecuteWrite', writes[0])
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
  },

  /** Given an offset & checksum, take the appropirate next action **/
  async webBluetoothDFUObjectValidate({ dispatch, commit }, payload) {
    var transferObject = payload.transferObject
    var offset = payload.offset
    var checksum = payload.checksum
    /** The checksum reported back from a NRF51/52 is a crc of the Transfer object's file up till the offset */
    let fileCRCToOffset = crc.crc32(transferObject.transfer.file.slice(0, offset))
    if (offset === transferObject.offset + transferObject.length && checksum === fileCRCToOffset) {
      /** Object has been transfered and should be moved into its right place on the device **/
      transferObject.state = TransferObjectState.Storing
      let write = new Writes.Execute(transferObject.transfer.packetPoint)
      dispatch('webBluetoothDFUScheduleWrite', write)
    } else if (offset === transferObject.offset || offset > transferObject.offset + transferObject.length || checksum !== fileCRCToOffset) {
      /** This object has not been trasnfered to the device or is faulty, recreate and transfer a new **/
      transferObject.state = TransferObjectState.Creating
      let write = new Writes.Create(transferObject.transfer.controlPoint,transferObject.type,transferObject.length)
      dispatch('webBluetoothDFUScheduleWrite', write)
    } else {
      /** its the right object on the device but it has not been transfred fully **/
      transferObject.state = TransferObjectState.Transfering
      dispatch('webBluetoothDFUObjectToPackets', transferObject)
      dispatch('webBluetoothDFUObjectSetPacketReturnNotification', transferObject)
      dispatch('webBluetoothDFUObjectTransferDataPackages', transferObject)
    }
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
  },

  /** Request a notification when all packets for this transferObject has been received on the device **/
  async webBluetoothDFUObjectSetPacketReturnNotification({ dispatch, commit }, transferObject) {
    let write = new Writes.PacketReturnNotification(transferObject.transfer.packetPoint,transferObject.chunks.length)
    write.transferObject = transferObject
    dispatch('webBluetoothDFUScheduleWrite', write)
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
  },

  /** handles events received on the Control Point Characteristic **/
  async webBluetoothDFUObjectHandleEvent ({ dispatch, commit }, payload) {
    let dataView = payload.dataView
    let transferObject = payload.transferObject
    /** Depending on which state this object is handle the relevent opcodes */
    payload.opCode = dataView.getInt8(1)
    payload.responseCode = dataView.getInt8(2)
    switch (transferObject.state) {
      case TransferObjectState.Creating:
        dispatch('webBluetoothDFUObjectHandleEventWhileCreating', payload)
        break
      case TransferObjectState.Transfering:
        dispatch('webBluetoothDFUObjectHandleEventWhileTransfering', payload)
        break
      case TransferObjectState.Storing: {
        dispatch('webBluetoothDFUObjectHandleEventWhileStoring', payload)
        break
      }
    }
  },

  async webBluetoothDFUObjectHandleEventWhileCreating ({ dispatch, commit }, payload) {
    if (payload.opCode === WriteTypes.SELECT && payload.responseCode === WriteResponses.SUCCESS) {
      /** verify how much how the transfer that has been completed */
      payload.offset = payload.dataView.getUint32(7, true)
      payload.checksum = payload.dataView.getUint32(11, true)
      dispatch('webBluetoothDFUObjectValidate', payload)
      commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
    } else if (payload.opCode === WriteTypes.CREATE && payload.responseCode === WriteResponses.SUCCESS) {
      payload.transferObject.state = TransferObjectState.Transfering
      /** start the transfer of the object  */
      dispatch('webBluetoothDFUObjectToPackets', payload.transferObject)
      dispatch('webBluetoothDFUObjectSetPacketReturnNotification', payload.transferObject)
      dispatch('webBluetoothDFUObjectTransferDataPackages', payload.transferObject)
      commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
    } else if (payload.opCode === WriteTypes.SET_PRN && payload.responseCode === WriteResponses.SUCCESS) {
      //
    } else {
      console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode)
    }
  },

  async webBluetoothDFUObjectHandleEventWhileTransfering ({ dispatch, commit }, payload) {
    if (payload.opCode === WriteTypes.CALCULATE_CHECKSUM && payload.responseCode === WriteResponses.SUCCESS) {
      /** verify how much how the transfer that has been completed */
      payload.offset = payload.dataView.getUint32(7, true)
      payload.checksum = payload.dataView.getUint32(11, true)
      dispatch('webBluetoothDFUObjectValidate', payload)
      commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
    } else if (payload.opCode === WriteTypes.SET_PRN && payload.responseCode === WriteResponses.SUCCESS) {
      //NOP
    } else {
      console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode)
    }
  },

  async webBluetoothDFUObjectHandleEventWhileStoring ({ dispatch, commit }, payload) {
    if (payload.opCode === WriteTypes.EXECUTE && payload.responseCode === WriteResponses.SUCCESS) {
      payload.transferObject.state = TransferObjectState.Completed
      commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
    } else if (payload.opCode === WriteTypes.SET_PRN && payload.responseCode === WriteResponses.SUCCESS) {
      //NOP
    } else {
      console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode)
    }
  }
}

export default TransferObjectActions
