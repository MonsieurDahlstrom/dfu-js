/** Library imports */
import EventEmitter from 'events'
/** internal imports */
import TransferStates from './states'
import {Task, TaskTypes, TaskResults} from '../task'
import {DFUObject, DFUObjectStates} from '../dfu-object'

var fileSymbol = Symbol();
var stateSymbol = Symbol();
var packetPointSymbol = Symbol();
var controlPointSymbol = Symbol();
var objectsSymbol = Symbol();
var maximumObjectLengthSymbol = Symbol()
var typeSymbol = Symbol()
var progressSymbol = Symbol()

class Transfer extends EventEmitter {
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
    if(this[stateSymbol] !== value) {
      this[stateSymbol] = value
      this.emit('stateChanged', {transfer:this, state:this[stateSymbol]})
    }
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
    if(value !== this[progressSymbol]) {
      this[progressSymbol] = value
      this.emit('progressChanged', {transfer: this, progress: value})
    }
  }

  constructor (fileData, controlPoint, packetPoint, objectType) {
    super()
    this[stateSymbol] = TransferStates.Prepare
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this[packetPointSymbol] = packetPoint
    this[controlPointSymbol] = controlPoint
    /** Data array representing the actual file to transfer **/
    this[fileSymbol] = fileData
    /** The DFUObjectType this file represents */
    this[typeSymbol] = objectType
    /** empty list of DFUObject */
    this[objectsSymbol] = []
    this[progressSymbol] = 0.0
  }

  checkProgress () {
    switch (this.state) {
      case TransferStates.Completed:
        this.progress = 1.0
        break
      case TransferStates.Failed:
        this.progress = 1.0
        break
      case TransferStates.Transfer:
        let percentagePerObject = 1.0/this.objects.length
        this.progress = this.objects.reduce((sum,dfuObject) => {
          switch (dfuObject.state) {
            case DFUObjectStates.Completed:
              return sum + percentagePerObject
            case DFUObjectStates.Failed:
              return sum + percentagePerObject
            case DFUObjectStates.Transfering:
              let percentageCompleted = dfuObject.progress.completed / dfuObject.progress.size
              return sum + (percentagePerObject * percentageCompleted)
            default:
              return sum
          }
        }, 0.0)
        break;
      default:
        this.progress = 0.0
    }
  }

  /** Begin the tranfer of a file by asking the NRF51/52 for meta data and verify if the file has been transfered already **/
  begin () {
    this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this))
    let operation = Task.verify(this.type, this.controlPoint)
    Task.Worker(operation,() => {})
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
      let object = new DFUObject(objectBegin, objectEnd, this, this.type)
      object.on('stateChanged', (event) => {
        if(event.state === DFUObjectStates.Failed) {
          this.state = TransferStates.Failed
        } else if ( event.state === DFUObjectStates.Completed) {
          this.nextObject()
        }
      })
      object.on('progressChanged', (event) => this.checkProgress())
      this.objects.push(object)
      index += this.maximumObjectLength
    }
  }

  /** handles events received on the Control Point Characteristic **/
  onEvent (event) {
    /** guard to filter events that are not response codes  */
    let dataView = event.target.value
    if (dataView && dataView.getInt8(0) !== TaskTypes.RESPONSE_CODE) {
      console.warn('Transfer.onEvent() opcode was not a response code')
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
          if (this.objects[this.currentObjectIndex].state === DFUObjectStates.Failed) {
            this.state == TransferStates.Failed
          }
        } else {
          this.state = TransferStates.Failed
        }
        break
      }
    }
  }

  /** Checks if Transfer is complete or starts transferring the next DFUObject **/
  nextObject () {
    if (this.currentObjectIndex < this.objects.length - 1) {
      this.currentObjectIndex++
      this.objects[this.currentObjectIndex].begin()
    } else {
      this.state = TransferStates.Completed
    }
  }
}

export default Transfer
