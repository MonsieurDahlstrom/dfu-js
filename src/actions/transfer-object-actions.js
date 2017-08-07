import crc from 'crc'
//
import * as Writes from '../types/write'
import * as MutationTypes from '../mutation-types'
import {TransferObjectState} from '../types/transfer-object'

const DATA_CHUNK_SIZE = 20

const TransferObjectActions = {

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
  async webBluetoothDFUObjectHandleEvent ({ dispatch, commit }, dataview) {
    /** Depending on which state this object is handle the relevent opcodes */
    let opCode = dataView.getInt8(1)
    let responseCode = dataView.getInt8(2)
    switch (this.state) {
      case TransferObjectState.Creating:
        dispatch('webBluetoothDFUObjectHandleEventWhileCreating', dataView)
        break
      case TransferObjectState.Transfering:
        dispatch('webBluetoothDFUObjectHandleEventWhileTransfering', dataView)
        break
      case TransferObjectState.Storing: {
        dispatch('webBluetoothDFUObjectHandleEventWhileStoring', dataView)
        break
      }
    }
  },

  async webBluetoothDFUObjectHandleEventWhileCreating ({ dispatch, commit }, dataview) {
    if (opCode === TaskType.SELECT && responseCode === TaskResult.SUCCESS) {
      /** verify how much how the transfer that has been completed */
      let currentOffset = dataView.getUint32(7, true)
      let currentCRC = dataView.getUint32(11, true)
      this.validate(currentOffset, currentCRC)
    } else if (opCode === TaskType.CREATE && responseCode === TaskResult.SUCCESS) {
      this.state = TransferObjectState.Transfering
      /** start the transfer of the object  */
      this.toPackets(0)
      this.transfer.addTask(this.setPacketReturnNotification())
      this.transfer()
    } else if (opCode === TaskType.SET_PRN && responseCode === TaskResult.SUCCESS) {
      //
    } else {
      console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
    }
  },

  async webBluetoothDFUObjectHandleEventWhileTransfering ({ dispatch, commit }, dataview) {
    if (opCode === TaskType.CALCULATE_CHECKSUM && responseCode === TaskResult.SUCCESS) {
      /** verify how much how the transfer that has been completed */
      let offset = dataView.getUint32(3, true)
      let checksum = dataView.getUint32(7, true)
      this.validate(offset, checksum)
    } else if (opCode === TaskType.SET_PRN && responseCode === TaskResult.SUCCESS) {
      //NOP
    } else {
      console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
    }
  },

  async webBluetoothDFUObjectHandleEventWhileStoring ({ dispatch, commit }, dataview) {
    if (opCode === TaskType.EXECUTE && responseCode === TaskResult.SUCCESS) {
      this.state = TransferObjectState.Completed
      this.onCompletition()
    } else if (opCode === TaskType.SET_PRN && responseCode === TaskResult.SUCCESS) {
      //NOP
    } else {
      console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
    }
  }
}

export default TransferObjectActions
