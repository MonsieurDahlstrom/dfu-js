/** Library imports */
import queue from 'async/queue'
/** internal imports */
import TransferStates from './states'
import {Task, TaskTypes, TaskResults} from '../task'
import {DFUObject} from '../dfu-object'

var fileSymbol = Symbol();
var stateSymbol = Symbol();
var packetPointSymbol = Symbol();
var controlPointSymbol = Symbol();
var tasksSymbol = Symbol();
var objectsSymbol = Symbol();
var maximumObjectLengthSymbol = Symbol()
var typeSymbol = Symbol()
var progressSymbol = Symbol()

class Transfer {
  /** Get/Set pair **/
  get file() {
    return this[fileSymbol]
  }

  set file(value) {
    this[fileSymbol] = value
  }

  /** Get/Set pair **/
  get state() {
    return this[stateSymbol]
  }

  set state(value) {
    this[stateSymbol] = value
  }

  /** Get/Set pair **/
  get packetPoint() {
    return this[packetPointSymbol]
  }

  set packetPoint(value) {
    this[packetPointSymbol] = value
  }

  /** Get/Set pair **/
  get controlPoint() {
    return this[controlPointSymbol]
  }

  set controlPoint(value) {
    this[controlPointSymbol] = value
  }

  /** Get/Set pair **/
  get tasks() {
    return this[tasksSymbol]
  }

  set tasks(value) {
    this[tasksSymbol] = value
  }

  /** Get/Set pair **/
  get objects() {
    return this[objectsSymbol]
  }

  set objects(value) {
    this[objectsSymbol] = value
  }

  /** Get/Set pair **/
  get maximumObjectLength() {
    return this[maximumObjectLengthSymbol]
  }

  set maximumObjectLength(value) {
    this[maximumObjectLengthSymbol] = value
  }

  /** Get/Set pair **/
  get type() {
    return this[typeSymbol]
  }

  set type(value) {
    this[typeSymbol] = value
  }

  /** Get/Set pair **/
  get progress() {
    return this[progressSymbol]
  }

  set progress(value) {
    this[progressSymbol] = value
  }

  constructor (fileData, controlPoint, packetPoint, objectType) {
    this[stateSymbol] = TransferStates.Prepare
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this[packetPointSymbol] = packetPoint
    this[controlPointSymbol] = controlPoint
    /** Data array representing the actual file to transfer **/
    this[fileSymbol] = fileData
    /** The DFUObjectType this file represents */
    this[typeSymbol] = objectType
    /** Create a queue to process the DFUObject's for this file in order */
    this[tasksSymbol] = queue(Task.Worker, 1)
    this[tasksSymbol].error = (error, task) => {
      console.error(error)
      console.error(task)
    }
    /** empty list of DFUObject */
    this[objectsSymbol] = []
  }

  calculateProgress () {
    switch (this.state) {
      case TransferStates.Prepare:
      {
        this.progress = 0.0
        break
      }
      case TransferStates.Transfer:
      {
        var difference = (this.currentObjectIndex+1) / this.objects.length
        if (difference < 1.0) {
          this.progress = difference - this.objects[this.currentObjectIndex].progress()
        } else {
          this.progress =  difference - 0.02
        }
        break
      }
      default:
      {
        this.progress =  1.0
        break
      }
    }
  }

  /** Schedules a BLE Action for execution and ensure the file transfer fail if an action cant be completed **/
  addTask (dfuTask) {
    if ((dfuTask instanceof Task) === false) {
      throw new Error('task is not of type Task')
    }
    this.tasks.push(dfuTask, (error) => {
      if (error) {
        this.tasks.kill()
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
    this.maximumObjectLength = maxiumSize
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
      let objectEnd = objectBegin + this.maximumObjectLength < fileEnd ? this.maximumObjectLength : (fileEnd - index)
      let object = new DFUObject(objectBegin, objectEnd, this, this.objectType, this.nextObject.bind(this))
      this.objects.push(object)
      index += this.maximumObjectLength
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
    this.calculateProgress()
  }

  /** Checks if Transfer is complete or starts transferring the next DFUObject **/
  nextObject () {
    if (this.currentObjectIndex < this.objects.length - 1) {
      this.tasks.kill()
      this.currentObjectIndex++
      this.objects[this.currentObjectIndex].begin()
    } else {
      this.state = TransferStates.Completed
    }
  }
}

export default Transfer
