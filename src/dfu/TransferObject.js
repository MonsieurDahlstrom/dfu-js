// Copyright (c) 2017 Monsieur Dahlström Ltd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import crc from 'crc'
import {Task, TaskType, TaskResult} from './Task'

const DATA_CHUNK_SIZE = 20

/** Different states a TransferObject can be in **/
const TransferObjectState = {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
}

/**
NRF51/52 can not process a a whole binary file in one go,
the transfer of a full binary file is done by creating a string of TransferObjects
with a maximum size that the MCU reports via bluewooth
**/
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

  /**
    Internal convinence methods, a transfer object might have been partially
    transfered already, if so the offset passed in is none zero.

    Based on the offset and length into the Transfer objects file and the given
    offset in this range, create the number of chunks needed.
  **/
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

  /** The first step in transferring this object, ask how much has already been transferred **/
  begin () {
    this.state = TransferObjectState.Creating
    this.parentTransfer.addTask(Task.verify(this.objectType, this.parentTransfer.controlPoint))
  }

  /** internal convinence method, extract how much of an object that has already been transfered **/
  verify (dataView) {
    let currentOffset = dataView.getUint32(7, true)
    let currentCRC = dataView.getUint32(11, true)
    this.validate(currentOffset, currentCRC)
  }

  /** convinence, returns a boolean for if a specific offset represents this object **/
  hasOffset (offset) {
    let min = this.parentOffset
    let max = min + this.objectLength
    return offset >= min && offset <= max
  }

  /** Given an offset & checksum, take the appropirate next action **/
  validate (offset, checksum) {
    /** The checksum reported back from a NRF51/52 is a crc of the Transfer object's file up till the offset */
    let fileCRCToOffset = crc.crc32(this.parentTransfer.file.slice(0, offset))
    if (offset === this.parentOffset + this.objectLength && checksum === fileCRCToOffset) {
      /** Object has been transfered and should be moved into its right place on the device **/
      this.state = TransferObjectState.Storing
      let operation = Task.execute(this.parentTransfer.controlPoint)
      this.parentTransfer.addTask(operation)
    } else if (offset === this.parentOffset || offset > this.parentOffset + this.objectLength || checksum !== fileCRCToOffset) {
      /** This object has not been trasnfered to the device or is faulty, recreate and transfer a new **/
      this.state = TransferObjectState.Creating
      let operation = Task.create(this.objectType, this.objectLength, this.parentTransfer.controlPoint)
      this.parentTransfer.addTask(operation)
    } else {
      /** its the right object on the device but it has not been transfred fully **/
      this.state = TransferObjectState.Transfering
      this.toPackets(offset)
      this.parentTransfer.addTask(this.setPacketReturnNotification())
      this.transfer()
    }
  }

  /** Slots all data chunks for transmission, the queue inside Transfer ensures the order **/
  transfer () {
    for (let index = 0; index < this.chunks.length; index++) {
      let buffer = this.chunks[index].buffer
      this.parentTransfer.addTask(Task.writePackage(buffer, this.parentTransfer.packetPoint))
    }
  }

  /** Request a notification when all packets for this transferObject has been received on the device **/
  setPacketReturnNotification () {
    return Task.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint)
  }

  /** handles events received on the Control Point Characteristic **/
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
    /** verify how much how the transfer that has been completed */
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
