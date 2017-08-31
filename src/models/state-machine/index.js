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

import queue from 'async/queue'
import EventEmitter from 'events'

import {Firmware, FirmwareType} from '../firmware'
import {Transfer, TransferStates, TransferWorker, CurrentTransfer, TransferTypes} from '../transfer'
import {Task} from '../task'
import StateMachineStates from './states'

/**
Main Facade class to the library
  Create StateMachine with WebBluetoothCharacteristics representing the data and control point
  Monitor the state property and use the function sendFirmware() to send a DFU zip.
**/

let stateSymbol = Symbol()
let controlPointSymbol = Symbol()
let packetPointSymbol = Symbol()
let transfersSymbol = Symbol()
let queueSymbol = Symbol()
let progressSymbol = Symbol()

class StateMachine extends EventEmitter {

  constructor (webBluetoothControlPoint, webBluetoothPacketPoint) {
    super()
    this[controlPointSymbol] = webBluetoothControlPoint
    this[packetPointSymbol] = webBluetoothPacketPoint
    if (this[controlPointSymbol] !== undefined && this[packetPointSymbol] !== undefined) {
      this[stateSymbol] = StateMachineStates.IDLE
    } else {
      this[stateSymbol] = StateMachineStates.NOT_CONFIGURED
    }
    this[transfersSymbol] = []
    this[queueSymbol] = queue(TransferWorker, 1)
    this[progressSymbol] = 0.0
  }

  /** get/set **/
  get state () {
    return this[stateSymbol]
  }

  set state (value) {
    if (value !== this[stateSymbol]) {
      this[stateSymbol] = value
      this.emit('stateChanged',{dfuStateMachine: this, state: value})
    }
  }
  /** get/set **/

  get controlPoint () {
    return this[controlPointSymbol]
  }

  set controlPoint (webBluetoothCharacteristic) {
    this[controlPointSymbol] = webBluetoothCharacteristic
    if (this.state === StateMachineStates.NOT_CONFIGURED && (this[controlPointSymbol] !== undefined && this[packetPointSymbol] !== undefined)) {
      this.state = StateMachineStates.IDLE
    } else if(this.state === StateMachineStates.IDLE && (this[controlPointSymbol] === undefined ||  this[packetPointSymbol] === undefined)) {
      this.state = StateMachineStates.NOT_CONFIGURED
    }
  }

  /** get/set **/

  get packetPoint () {
    return this[packetPointSymbol]
  }

  set packetPoint (webBluetoothCharacteristic) {
    this[packetPointSymbol] = webBluetoothCharacteristic
    if (this.state === StateMachineStates.NOT_CONFIGURED && (this[controlPointSymbol] !== undefined && this[packetPointSymbol] !== undefined)) {
      this.state = StateMachineStates.IDLE
    } else if(this.state === StateMachineStates.IDLE && (this[controlPointSymbol] === undefined ||  this[packetPointSymbol] === undefined)) {
      this.state = StateMachineStates.NOT_CONFIGURED
    }
  }

  /** get/set **/

  get transfers () {
    return this[transfersSymbol]
  }


  /** get/set **/

  get progress () {
    return this[progressSymbol]
  }

  set progress (value) {
    if (value !== this[progressSymbol]) {
      this[progressSymbol] = value
      this.emit('progressChanged',{dfuStateMachine: this, progress: value})
    }
  }
  /** get/set **/

  get queue () {
    return this[queueSymbol]
  }


  calculateProgress () {
    switch (this.state) {
      case StateMachineStates.NOT_CONFIGURED:
        this.progress = 0.0
        break
      case StateMachineStates.IDLE:
        this.progress = 0.0
        break
      case StateMachineStates.COMPLETE:
        this.progress = 1.0
        break
      case StateMachineStates.FAILED:
        this.progress = 1.0
        break
      case StateMachineStates.TRANSFERING:
        if (this.transfers.length > 0) {
          let completedTransfersCount = this.transfers.reduce((sum,value) => {
            return (value.state === TransferStates.Failed || value.state === TransferStates.Completed) ? sum + 1 : sum
          }, 0)
          let percentageValue = 1.0 / this.transfers.length
          let newProgress = percentageValue * completedTransfersCount
          if(CurrentTransfer().state === TransferStates.Transfer) {
            newProgress += percentageValue * CurrentTransfer().progress
          }
          this.progress = newProgress
        }
        break
    }
  }
  /**
    Internal method used to slot each part of a dfu zip for transfer to device
  **/
  addTransfer (transfer) {
    this.transfers.push(transfer)
    this.queue.push(transfer, (error) => {
      if (error) {
        this.queue.kill()
        this.state = StateMachineStates.FAILED
      } else if (transfer.state === StateMachineStates.FAILED) {
        this.queue.kill()
        this.state = StateMachineStates.FAILED
      } else if(this.queue.length() === 0) {
        this.state = StateMachineStates.COMPLETE
      }
    })
  }

  /**
    Send a firmware to a device. Throws when parameter or state is invalid for sending a firmware
  **/
  sendFirmware (firmware) {
    if (this.state === StateMachineStates.NOT_CONFIGURED) {
      throw new Error('StateMachine is not configured with bluetooth characteristics')
    }
    if (this.state !== StateMachineStates.IDLE) {
      throw new Error('Can only initate transfer when idle')
    }
    if (firmware instanceof Firmware === false) {
      throw new Error('Firmware needs to be of class Firmware')
    }
    for(var section of firmware.sections) {
      var updateFunc = (event) => {
        this.calculateProgress()
      }
      let datTransfer = new Transfer(section.dat, this.controlPoint, this.packetPoint, TransferTypes.Command)
      datTransfer.on('progressChanged', updateFunc)
      let binTransfer = new Transfer(section.bin, this.controlPoint, this.packetPoint, TransferTypes.Data)
      binTransfer.on('progressChanged', updateFunc)
      this.addTransfer(datTransfer)
      this.addTransfer(binTransfer)
    }
    this.state = StateMachineStates.TRANSFERING
  }

  reset () {
    this.queue.kill()
    this.state = StateMachineStates.IDLE
  }
}

module.exports.DFUStateMachineStates = StateMachineStates
module.exports.DFUStateMachine = StateMachine
