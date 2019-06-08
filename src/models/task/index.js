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
"use strict";

import TaskTypes from './types'
import TaskResults from './results'

class Task {

  constructor (characteristicToWriteTo, bytesToWrite, commandToExecute) {
    this.opcode = commandToExecute
    this.buffer = bytesToWrite
    this.characteristic = characteristicToWriteTo
  }

  static async Worker (task, onCompleition) {
    if (task instanceof Task === false) {
      throw new Error('task not of type Task')
    }
    if (!onCompleition) {
      throw new Error('onCompleition is not set')
    }
    try {
      await task.characteristic.writeValue(task.buffer)
      onCompleition()
    } catch (exception) {
      console.log(exception)
      onCompleition('BLE Transfer Failed')
    }
  }

  static verify (objectType, characteristic) {
    let dataView = new DataView(new ArrayBuffer(2))
    dataView.setUint8(0, TaskTypes.SELECT)
    dataView.setUint8(1, objectType)
    return new Task(characteristic, dataView.buffer, TaskTypes.SELECT)
  }

  static create (objectType, length, characteristic) {
    let dataView = new DataView(new ArrayBuffer(6))
    dataView.setUint8(0, TaskTypes.CREATE)
    dataView.setUint8(1, objectType)
    /** Data length set to little endian converstion */
    dataView.setUint32(2, length, true)
    return new Task(characteristic, dataView.buffer, TaskTypes.CREATE)
  }

  static setPacketReturnNotification (packageCount, characteristic) {
    let dataView = new DataView(new ArrayBuffer(3))
    dataView.setUint8(0, TaskTypes.SET_PRN)
    /** Set the package received notification to the number of expected packages */
    dataView.setUint16(1, packageCount, true)
    return new Task(characteristic, dataView.buffer, TaskTypes.SET_PRN)
  }

  static writePackage (buffer, characteristic) {
    return new Task(characteristic, buffer)
  }

  static checksum (characteristic) {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, TaskTypes.CALCULATE_CHECKSUM)
    return new Task(characteristic, dataView.buffer, TaskTypes.CALCULATE_CHECKSUM)
  }

  static execute (characteristic) {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, TaskTypes.EXECUTE)
    return new Task(characteristic, dataView.buffer, TaskTypes.EXECUTE)
  }
}

export { Task, TaskTypes, TaskResults }
