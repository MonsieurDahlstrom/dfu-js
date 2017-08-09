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
import * as WriteActions from './write'
import TransmissionStatus from './transmission-types'

// import {Task, TaskType, TaskResult} from './Task'



/**
Nordic defines two different type of file transfers:
    init package is known as Command object
    firmware is known as Data object
**/
const TransferObjectType = {
  Command: 0x01,
  Data: 0x02
}

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

  constructor (offset, length, transfer, transferType) {
    // Reference to parent transfer that stores the file data
    this.transfer = transfer
    // The offset into the file data
    this.offset = offset
    // How long this object is
    this.length = length
    // TransferObjectType for this transfer object
    this.type = transferType
    // Initial state
    this.state = TransferObjectState.NotStarted
    //array that tracks all packages of data that needs to be transfered
    this.chunks = []
  }

  /** convinence, returns a boolean for if a specific offset represents this object **/
  hasOffset (offset) {
    let min = this.offset
    let max = min + this.length
    return offset >= min && offset <= max
  }

}

module.exports.TransferObject = TransferObject
module.exports.TransferObjectState = TransferObjectState
module.exports.TransferObjectType = TransferObjectType
