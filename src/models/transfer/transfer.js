/** Library imports */
import queue from 'async/queue'
/** internal imports */
import TransferStates from './states'
import {Task, TaskTypes, TaskResults} from '../task'
import {DFUObject} from '../dfu-object'

class Transfer {

  constructor (fileData, controlPoint, packetPoint, objectType) {
    this.state = TransferStates.Prepare
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this.packetPoint = packetPoint
    this.controlPoint = controlPoint
    /** Data array representing the actual file to transfer **/
    this.file = fileData
    /** The DFUObjectType this file represents */
    this.objectType = objectType
    /** Create a queue to process the DFUObject's for this file in order */
    this.bleTasks = queue(Task.Worker, 1)
    this.bleTasks.error = (error, task) => {
      console.error(error)
      console.error(task)
    }
  }

  progress () {
    switch (this.state) {
      case TransferStates.Prepare:
      {
        return 0.0
      }
      case TransferStates.Transfer:
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
    if ((dfuTask instanceof Task) === false) {
      throw new Error('task is not of type Task')
    }
    this.bleTasks.push(dfuTask, (error) => {
      if (error) {
        this.bleTasks.kill()
        this.state = TransferStates.Failed
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
  at a time varies. This method creates a set of DFUObject with this maxium size
  set.

  Secondly the device reports back how much of the file has been transfered and what the crc
  so far is. This method skips object that has already been completed
  **/
  prepareDFUObjects (maxiumSize, currentOffset, currentCRC) {
    this.maxObjectLength = maxiumSize
    this.objects = []
    this.currentObjectIndex = 0
    this.generateObjects()
    /** Skip to object for the offset **/
    let object = this.objects.find((item) => item.hasOffset(currentOffset))
    if (object) {
      this.currentObjectIndex = this.objects.indexOf(object)
    }
    this.state = TransferStates.Transfer
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
      let object = new DFUObject(objectBegin, objectEnd, this, this.objectType, this.nextObject.bind(this))
      this.objects.push(object)
      index += this.maxObjectLength
    }
  }

  /** handles events received on the Control Point Characteristic **/
  onEvent (event) {
    /** guard to filter events that are not response codes  */
    let dataView = event.target.value
    if (dataView && dataView.getInt8(0) !== TaskTypes.RESPONSE_CODE) {
      console.log('Transfer.onEvent() opcode was not a response code')
      return
    }
    switch (this.state) {
      case TransferStates.Prepare: {
        let opCode = dataView.getInt8(1)
        let responseCode = dataView.getInt8(2)
        if (opCode === TaskTypes.SELECT && responseCode === TaskResults.SUCCESS) {
          let maxiumSize = dataView.getUint32(3, true)
          let currentOffset = dataView.getUint32(7, true)
          let currentCRC = dataView.getUint32(11, true)
          this.prepareDFUObjects(maxiumSize, currentOffset, currentCRC)
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

  /** Checks if Transfer is complete or starts transferring the next DFUObject **/
  nextObject () {
    if (this.currentObjectIndex < this.objects.length - 1) {
      this.bleTasks.kill()
      this.currentObjectIndex++
      this.objects[this.currentObjectIndex].begin()
    } else {
      this.state = TransferStates.Completed
    }
  }
}

export default Transfer
