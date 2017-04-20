/** Library imports */
import queue from 'async/queue'
/** internal imports */
import {TransferObject} from './TransferObject'
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
    if (task instanceof Transfer === false) {
      throw new Error('task is not of type Task')
    }
    if (!onCompleition) {
      throw new Error('onCompleition is not set')
    }
    task.begin()
    const intervalTimer = setInterval(() => {
      if (task.state === TransferState.Failed) {
        clearInterval(intervalTimer)
        task.end()
        onCompleition('Failed Transfer')
      } else if (task.state === TransferState.Completed) {
        clearInterval(intervalTimer)
        task.end()
        onCompleition()
      }
    }, 1000)
  }

  constructor (fileData, controlPoint, packetPoint, objectType) {
    this.state = TransferState.Prepare
    this.packetPoint = packetPoint
    this.controlPoint = controlPoint
    this.file = fileData
    this.objectType = objectType
    this.bleTasks = queue(Task.Worker, 1)
    this.bleTasks.empty = () => {
    }
    this.bleTasks.error = (error, task) => {
      console.error(error)
      console.error(task)
    }
  }

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

  begin () {
    this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this))
    let operation = Task.verify(this.objectType, this.controlPoint)
    this.addTask(operation)
  }

  end () {
    this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent)
  }

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
      this.state = TransferState.Completed
    }
  }
}

module.exports.Transfer = Transfer
module.exports.TransferState = TransferState
module.exports.TransferObjectType = TransferObjectType
