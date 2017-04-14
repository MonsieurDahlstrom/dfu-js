/** Library imports */
import queue from 'async/queue'
/** internal imports */
import {TransferObject,TransferObjectState} from './TransferObject'
import {Task, TaskType, TaskResult} from './Task'

const TransferState = {
  Prepare: 0x00,
  Transfer: 0x01,
  Completed: 0x02,
  Failed: 0x03
}

const TransferObjectType = {
  Command: 0x01,
  Data: 0x02
}

class Transfer {

  static Worker (task, onCompleition) {
    if(task instanceof Task === false) {
      throw new Error("task is not of type Task")
    }
    if(!onCompleition) {
      throw new Error("onCompleition is not set")
    }
    task.begin()
    const intervalTimer = setInterval(() => {
      if (task.state === DFUTransferState.Failed) {
        clearInterval(intervalTimer)
        task.end()
        onCompleition('Failed Transfer')
      } else if (task.state === DFUTransferState.Completed) {
        clearInterval(intervalTimer)
        task.end()
        onCompleition()
      }
    }, 1000)
  }

  constructor (fileData, manager, packetPoint, controlPoint, objectType) {
    this.state = TransferState.Prepare
    this.packetPoint = packetPoint
    this.controlPoint = controlPoint
    this.stateMachine = manager
    this.file = fileData
    this.objectType = objectType
    this.bleTasks = queue(Task.Worker, 1)
  }

  addTask (dfuTask) {
    if(dfuTask instanceof Task === false) {
      throw new Error("task is not of type Task")
    }
    this.bleTasks.push(dfuTask, (error) => {
      if (error) {
        this.bleTasks.kill()
        this.state = TransferState.Failed
      }
    })
  }

  begin () {
    this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this))
    let operation = Task.verify(this.objectType, this.controlPoint)
    this.addTask(operation)
  }

  end () {
    this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent)
  }

  prepareTransferObjects (maxiumSize, currentoffset, currentCRC) {
    this.objectLength = maxiumSize
    this.objects = []
    this.currentObjectIndex = 0
    let counter = 0
    while (this.file.length > counter * this.objectLength) {
      let offset = counter * this.objectLength
      let dataslice = this.file.slice(offset, offset + this.objectLength)
      this.objects[counter] = new DFUObject(dataslice, offset, this.objectType, this, this.nextObject.bind(this))
      counter++
    }
    /** Skip to object for the offset **/
    let object = this.objects.find((item) => item.offset === currentoffset)
    if (object) {
      this.currentObjectIndex = this.objects.indexOf(object)
    }
    this.state = DFUTransferState.Transfer
    this.objects[this.currentObjectIndex].begin()
  }

  onEvent (event) {
    /** guard to filter events that are not response codes  */
    let dataView = event.target.value
    if (dataView && dataView.getInt8(0) !== WWSecureDFUOperations.RESPONSE_CODE) {
      console.log('DFUTransfer.onEvent() opcode was not a response code')
      return
    }
    /** */
    switch (this.state) {
      case DFUTransferState.Prepare: {
        let opCode = dataView.getInt8(1)
        let responseCode = dataView.getInt8(2)
        if (opCode === WWSecureDFUOperations.SELECT && responseCode === WWSecureDFUResults.SUCCESS) {
          let maxiumSize = dataView.getUint32(3, true)
          let currentOffset = dataView.getUint32(7, true)
          let currentCRC = dataView.getUint32(11, true)
          this.prepareTransferObjects(maxiumSize, currentOffset, currentCRC)
        }
        break
      }
      default: {
        this.objects[this.currentObjectIndex].eventHandler(dataView)
        break
      }
    }
  }

  nextObject () {
    if (this.currentObjectIndex < this.objects.length - 1) {
      this.bleTasks.kill()
      this.currentObjectIndex++
      this.objects[this.currentObjectIndex].begin()
    } else {
      this.state = DFUTransferState.Completed
    }
  }
}

module.exports.Transfer = Transfer
module.exports.TransferState = TransferState
module.exports.TransferObjectType = TransferObjectType
