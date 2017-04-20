import crc from 'crc'
import {Task, TaskType, TaskResult} from './Task'

const DATA_CHUNK_SIZE = 20

const TransferObjectState = {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
}

class TransferObject {

  constructor (offset, length, transfer, transferType, onCompletitionCallback) {
    // function to call when transfer completes or fails
    this.onCompletition = onCompletitionCallback
    // Reference to parent transfer that stores the file data
    this.parentTransfer = transfer
    // The offset into the file data
    this.parentOffset = offset
    // How long this object is
    this.objectLength = length
    // TransferObjectType for this transfer object
    this.objectType = transferType
    // Initial state
    this.state = TransferObjectState.NotStarted
  }

  toPackets (offset) {
    this.chunks = []
    let parentFileEnd = this.parentOffset + this.objectLength
    let parentFileBegin = this.parentOffset + offset
    let index = parentFileBegin
    while (index < parentFileEnd) {
      let chunkBegin = index
      let chunkEnd = chunkBegin + DATA_CHUNK_SIZE < parentFileEnd ? chunkBegin + DATA_CHUNK_SIZE : chunkBegin + (parentFileEnd - index)
      let chunk = this.parentTransfer.file.slice(chunkBegin, chunkEnd)
      this.chunks.push(chunk)
      index += DATA_CHUNK_SIZE
    }
  }

  begin () {
    this.state = TransferObjectState.Creating
    this.parentTransfer.addTask(Task.verify(this.objectType, this.parentTransfer.controlPoint))
  }

  verify (dataView) {
    let currentOffset = dataView.getUint32(7, true)
    let currentCRC = dataView.getUint32(11, true)
    this.validate(currentOffset, currentCRC)
  }

  hasOffset (offset) {
    let min = this.parentOffset
    let max = min + this.objectLength
    return offset >= min && offset <= max
  }

  validate (offset, checksum) {
    let fileCRCToOffset = crc.crc32(this.parentTransfer.file.slice(0, offset))
    if (offset === this.parentOffset + this.objectLength && checksum === fileCRCToOffset) {
      this.state = TransferObjectState.Storing
      let operation = Task.execute(this.parentTransfer.controlPoint)
      this.parentTransfer.addTask(operation)
    } else if (offset === this.parentOffset || offset > this.parentOffset + this.objectLength || checksum !== fileCRCToOffset) {
      this.state = TransferObjectState.Creating
      let operation = Task.create(this.objectType, this.objectLength, this.parentTransfer.controlPoint)
      this.parentTransfer.addTask(operation)
    } else {
      this.state = TransferObjectState.Transfering
      this.toPackets(offset)
      this.parentTransfer.addTask(this.setPacketReturnNotification())
      this.transfer()
    }
  }

  transfer () {
    for (let index = 0; index < this.chunks.length; index++) {
      let buffer = this.chunks[index].buffer
      this.parentTransfer.addTask(Task.writePackage(buffer, this.parentTransfer.packetPoint))
    }
  }

  setPacketReturnNotification () {
    return Task.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint)
  }

  eventHandler (dataView) {
    /** Depending on which state this object is handle the relevent opcodes */
    let opCode = dataView.getInt8(1)
    let responseCode = dataView.getInt8(2)
    switch (this.state) {
      case TransferObjectState.Creating: {
        if (opCode === TaskType.SELECT && responseCode === TaskResult.SUCCESS) {
          this.onSelect(dataView)
        } else if (opCode === TaskType.CREATE && responseCode === TaskResult.SUCCESS) {
          this.onCreate(dataView)
        } else if (opCode === TaskType.SET_PRN && responseCode === TaskResult.SUCCESS) {
          this.onPacketNotification(dataView)
        } else {
          console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
        }
        break
      }
      case TransferObjectState.Transfering: {
        if (opCode === TaskType.CALCULATE_CHECKSUM && responseCode === TaskResult.SUCCESS) {
          this.onChecksum(dataView)
        } else if (opCode === TaskType.SET_PRN && responseCode === TaskResult.SUCCESS) {
          this.onPacketNotification(dataView)
        } else {
          console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
        }
        break
      }
      case TransferObjectState.Storing: {
        if (opCode === TaskType.EXECUTE && responseCode === TaskResult.SUCCESS) {
          this.onExecute()
        } else if (opCode === TaskType.SET_PRN && responseCode === TaskResult.SUCCESS) {
          this.onPacketNotification(dataView)
        } else {
          console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
        }
        break
      }
    }
  }

  onSelect (dataView) {
    /** verify how much how the transfer that has been completed */
    this.verify(dataView)
  }

  onCreate (dataView) {
    this.state = TransferObjectState.Transfering
    /** start the transfer of the object  */
    this.toPackets(0)
    this.parentTransfer.addTask(this.setPacketReturnNotification())
    this.transfer()
  }

  onChecksum (dataView) {
    let offset = dataView.getUint32(3, true)
    let checksum = dataView.getUint32(7, true)
    this.validate(offset, checksum)
  }

  onPacketNotification (dataView) {
  }

  onExecute (dataView) {
    this.state = TransferObjectState.Completed
    this.onCompletition()
  }
}

module.exports.TransferObject = TransferObject
module.exports.TransferObjectState = TransferObjectState
