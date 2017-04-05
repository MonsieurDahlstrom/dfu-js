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

  constructor (dataslice, offset, type, dfuTransfer, onCompletition) {
    this.completitionCB = onCompletition
    this.parentTransfer = dfuTransfer
    this.state = DFUObjectState.NotStarted
    this.dataslice = dataslice
    this.offset = offset
    this.objectType = type
    this.crc = crc.crc32(dataslice)
    this.chunks = []
    let counter = 0
    while (this.dataslice.length > counter * DATA_CHUNK_SIZE) {
      this.chunks.push(this.dataslice.slice(counter * DATA_CHUNK_SIZE, counter * DATA_CHUNK_SIZE + DATA_CHUNK_SIZE))
      counter++
    }
  }

  begin () {
    this.state = DFUObjectState.Creating
    this.parentTransfer.addTask(DFUTask.verify(this.objectType, this.parentTransfer.controlPoint))
  }

  verify (dataView) {
    let currentOffset = dataView.getUint32(7, true)
    let currentCRC = dataView.getUint32(11, true)
    this.parentTransfer.addTask(this.setPacketReturnNotification())
    this.validate(currentOffset, currentCRC)
  }

  validate (offset, checksum) {
    if (offset !== this.offset + this.dataslice.length && checksum !== this.crc) {
      if (offset === 0 || offset > this.offset + this.dataslice.length || checksum !== this.crc) {
        this.state = DFUObjectState.Creating
        let operation = DFUTask.create(this.objectType, this.dataslice.length, this.parentTransfer.controlPoint)
        this.parentTransfer.addTask(operation)
      } else {
        this.transfer(offset)
      }
    } else {
      this.state = DFUObjectState.Storing
      let operation = DFUTask.execute(this.parentTransfer.controlPoint)
      this.parentTransfer.addTask(operation)
    }
  }

  transfer (offset) {
    for (let index = 0; index < this.chunks.length; index++) {
      let buffer = this.chunks[index].buffer
      this.parentTransfer.addTask(DFUTask.writePackage(buffer, this.parentTransfer.packetPoint))
    }
    // this.parentTransfer.addTask(DFUTask.checksum(this.parentTransfer.controlPoint))
  }

  setPacketReturnNotification () {
    return DFUTask.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint)
  }

  eventHandler (dataView) {
    /** Depending on which state this object is handle the relevent opcodes */
    let opCode = dataView.getInt8(1)
    let responseCode = dataView.getInt8(2)
    switch (this.state) {
      case DFUObjectState.Creating: {
        if (opCode === WWSecureDFUOperations.SELECT && responseCode === DFUOperationResults.SUCCESS) {
          this.onSelect(dataView)
        } else if (opCode === WWSecureDFUOperations.CREATE && responseCode === DFUOperationResults.SUCCESS) {
          this.onCreate(dataView)
        } else if (opCode === WWSecureDFUOperations.SET_PRN && responseCode === DFUOperationResults.SUCCESS) {
          this.onPacketNotification(dataView)
        } else {
          console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
        }
        break
      }
      case DFUObjectState.Transfering: {
        if (opCode === WWSecureDFUOperations.CALCULATE_CHECKSUM && responseCode === DFUOperationResults.SUCCESS) {
          this.onChecksum(dataView)
        } else if (opCode === WWSecureDFUOperations.SET_PRN && responseCode === DFUOperationResults.SUCCESS) {
          this.onPacketNotification(dataView)
        } else {
          console.log('  Operation: ' + opCode + ' Result: ' + responseCode)
        }
        break
      }
      case DFUObjectState.Storing: {
        if (opCode === WWSecureDFUOperations.EXECUTE && responseCode === DFUOperationResults.SUCCESS) {
          this.onExecute()
        } else if (opCode === WWSecureDFUOperations.SET_PRN && responseCode === WWSecureDFUOperations.SUCCESS) {
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
    this.state = DFUObjectState.Transfering
    /** start the transfer of the object  */
    this.transfer(0)
  }

  onChecksum (dataView) {
    let offset = dataView.getUint32(3, true)
    let checksum = dataView.getUint32(7, true)
    this.validate(offset, checksum)
  }

  onPacketNotification (dataView) {
  }

  onExecute (dataView) {
    this.state = DFUObjectState.Completed
    this.completitionCB()
  }
}

module.exports.TransferObject = TransferObject
module.exports.TransferObjectState = TransferObjectState
