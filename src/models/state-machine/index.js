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
import {Firmware, FirmwareType} from '../firmware'
import {Transfer, TransferWorker, CurrentTransfer, TransferTypes} from '../transfer'
import StateMachineStates from './states'
/**
Main Facade class to the library
  Create StateMachine with WebBluetoothCharacteristics representing the data and control point
  Monitor the state property and use the function sendFirmware() to send a DFU zip.
**/
class StateMachine {

  constructor (webBluetoothControlPoint, webBluetoothPacketPoint) {
    this._state = StateMachineStates.NOT_CONFIGURED
    Object.defineProperty(this,"state",{
      get: function () {
        return this._state
      },
      set: function (value) {
        this._state = value
        if (this.delegate !== undefined) {
          this.delegate.updateStateMachine()
        }
      },
      configurable: true
    })
    this.setControlPoint(webBluetoothControlPoint)
    this.setPacketPoint(webBluetoothPacketPoint)
    /** TODO: The queue should have better error reporting which are tied to state */
    this.fileTransfers = queue(TransferWorker, 1)
    if (this.controlpointCharacteristic && this.packetCharacteristic) {
      this.state = StateMachineStates.IDLE
    }
  }
/*
  constructor (webBluetoothControlPoint, webBluetoothPacketPoint) {
    this.state = StateMachineStates.NOT_CONFIGURED
    this.setControlPoint(webBluetoothControlPoint)
    this.setPacketPoint(webBluetoothPacketPoint)
    this.fileTransfers = queue(TransferWorker, 1)
    if (this.controlpointCharacteristic && this.packetCharacteristic) {
      this.state = StateMachineStates.IDLE
    }
  }
*/
  setDelegate (delegate) {
    this.delegate = delegate
  }

  setControlPoint (webBluetoothCharacteristic) {
    this.controlpointCharacteristic = webBluetoothCharacteristic
    if (this.state === StateMachineStates.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
      this.state = StateMachineStates.IDLE
    }
  }

  setPacketPoint (webBluetoothCharacteristic) {
    this.packetCharacteristic = webBluetoothCharacteristic
    if (this.state === StateMachineStates.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
      this.state = StateMachineStates.IDLE
    }
  }

  progress () {
    switch (this.state) {
      case StateMachineStates.NOT_CONFIGURED:
        return 0.0
      case StateMachineStates.IDLE:
        return 0.0
      case StateMachineStates.COMPLETE:
        return 1.0
      case StateMachineStates.FAILED:
        return 1.0
      case StateMachineStates.TRANSFERING:
        if (CurrentTransfer !== undefined) {
          return CurrentTransfer.progress()
        } else {
          return 0.0
        }
    }
  }
  /**
    Internal method used to slot each part of a dfu zip for transfer to device
  **/
  addTransfer (transfer) {
    this.fileTransfers.push(transfer, (error) => {
      if (error) {
        this.fileTransfers.kill()
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
      this.addTransfer(new Transfer(section.dat, this.controlpointCharacteristic, this.packetCharacteristic, TransferTypes.Command))
      this.addTransfer(new Transfer(section.bin, this.controlpointCharacteristic, this.packetCharacteristic, TransferTypes.Data))
    }
  }

}

module.exports.DFUStateMachineStates = StateMachineStates
module.exports.DFUStateMachine = StateMachine
