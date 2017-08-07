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

/** Library imports */
import queue from 'async/queue'
/** internal imports */
import {TransferObject} from './transfer-object'
// import {Task, TaskType, TaskResult} from './Task'



/**
Transfer class represents a binary file inside a firmware update zip.
A firmware update consists of a init package and data file. The StateMachine
parases the zip file and creates a transfer object for each entry in the zip

The statemachine uses a queue to slot the Transfers in order
**/
let CurrentTransfer = undefined

const TransferWorker = function (task, onCompleition) {
  if (task instanceof Transfer === false) {
    throw new Error('task is not of type Task')
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set')
  }
  CurrentTransfer = task
  task.begin()
  const intervalTimer = setInterval(() => {
    if (task.state === TransferState.Failed) {
      clearInterval(intervalTimer)
      task.end()
      CurrentTransfer = undefined
      onCompleition('Failed Transfer')
    } else if (task.state === TransferState.Completed) {
      clearInterval(intervalTimer)
      task.end()
      CurrentTransfer = undefined
      onCompleition()
    }
  }, 1000)
}

class Transfer {

  constructor (fileData, controlPoint, packetPoint, objectType) {
    this.state = TransferState.Prepare
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this.packetPoint = packetPoint
    this.controlPoint = controlPoint
    /** Data array representing the actual file to transfer **/
    this.file = fileData
    /** The TransferObjectType this file represents */
    this.objectType = objectType
    /** Create a queue to process the TransferObject's for this file in order */
    this.bleTasks = queue(Task.Worker, 1)
    this.bleTasks.error = (error, task) => {
      console.error(error)
      console.error(task)
    }
  }

  progress () {
    switch (this.state) {
      case TransferState.Prepare:
      {
        return 0.0
      }
      case TransferState.Transfer:
      {
        var difference = (this.currentObjectIndex+1) / this.objects.length
        if (difference < 1.0) {
          return difference - this.objects[this.currentObjectIndex].progress()
        } else {
          return difference - 0.02
        }
      }
      default:
      {
        return 1.0
      }
    }
  }

  /** Schedules a BLE Action for execution and ensure the file transfer fail if an action cant be completed **/
  addTask (dfuTask) {
    if (dfuTask instanceof Task === false) {
      throw new Error('task is not of type Task')
    }
    this.bleTasks.push(dfuTask, (error) => {
      if (error) {
        this.bleTasks.kill()
        this.state = TransferState.Failed
        console.error(error)
      }
    })
  }

  /** Begin the tranfer of a file by asking the NRF51/52 for meta data and verify if the file has been transfered already **/
  begin () {
    this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this))
    let operation = Task.verify(this.objectType, this.controlPoint)
    this.addTask(operation)
  }

  /** Clean up event registrations when transfer is completed **/
  end () {
    this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent)
  }

  /**
  Given the type of device and object type, the maxium size that can be processed
  at a time varies. This method creates a set of TransferObject with this maxium size
  set.

  Secondly the device reports back how much of the file has been transfered and what the crc
  so far is. This method skips object that has already been completed
  **/
  prepareTransferObjects (maxiumSize, currentOffset, currentCRC) {
    this.maxObjectLength = maxiumSize
    this.objects = []
    this.currentObjectIndex = 0
    this.generateObjects()
    /** Skip to object for the offset **/
    let object = this.objects.find((item) => item.hasOffset(currentOffset))
    if (object) {
      this.currentObjectIndex = this.objects.indexOf(object)
    }
    this.state = TransferState.Transfer
    this.objects[this.currentObjectIndex].validate(currentOffset, currentCRC)
  }

  /**
  Internal convinence method.
  **/
  generateObjects () {
    let fileBegin = 0
    let fileEnd = this.file.length
    let index = fileBegin
    while (index < fileEnd) {
      let objectBegin = index
      let objectEnd = objectBegin + this.maxObjectLength < fileEnd ? this.maxObjectLength : (fileEnd - index)
      let object = new TransferObject(objectBegin, objectEnd, this, this.objectType, this.nextObject.bind(this))
      this.objects.push(object)
      index += this.maxObjectLength
    }
  }

  /** handles events received on the Control Point Characteristic **/
  onEvent (event) {
    /** guard to filter events that are not response codes  */
    let dataView = event.target.value
    if (dataView && dataView.getInt8(0) !== TaskType.RESPONSE_CODE) {
      console.log('Transfer.onEvent() opcode was not a response code')
      return
    }
    switch (this.state) {
      case TransferState.Prepare: {
        let opCode = dataView.getInt8(1)
        let responseCode = dataView.getInt8(2)
        if (opCode === TaskType.SELECT && responseCode === TaskResult.SUCCESS) {
          let maxiumSize = dataView.getUint32(3, true)
          let currentOffset = dataView.getUint32(7, true)
          let currentCRC = dataView.getUint32(11, true)
          this.prepareTransferObjects(maxiumSize, currentOffset, currentCRC)
        }
        break
      }
      default: {
        if (this.objects !== undefined && this.objects[this.currentObjectIndex] !== undefined) {
          this.objects[this.currentObjectIndex].eventHandler(dataView)
        } else {
          console.error('Transfer.onEvent called with no objects or no current object')
        }
        break
      }
    }
  }

  /** Checks if Transfer is complete or starts transferring the next TransferObject **/
  nextObject () {
    if (this.currentObjectIndex < this.objects.length - 1) {
      this.bleTasks.kill()
      this.currentObjectIndex++
      this.objects[this.currentObjectIndex].begin()
    } else {
      this.state = TransferState.Completed
    }
  }
}

module.exports.Transfer = Transfer
module.exports.TransferWorker = TransferWorker
module.exports.CurrentTransfer = CurrentTransfer
module.exports.TransferState = TransferState
module.exports.TransferObjectType = TransferObjectType
