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
import {Firmware} from './firmware'
import {Transfer, TransferObjectType} from './dfu'

/**
The states a DFU StateMachine can have:
  - NOT_CONFIGURED, bluetooth characteristics have not been set
  - IDLE, state machine is ready for use
  - TRANSFERING, state machine is i the process of updating a device
  - COMPLETE, indicates that a device update has been completed
  - FAILED, device update failed
**/
const StateMachineStates = {
  NOT_CONFIGURED: 0x00,
  IDLE: 0x01,
  TRANSFERING: 0x02,
  COMPLETE: 0x03,
  FAILED: 0x04
}

/**
Main Facade class to the library
  Create StateMachine with WebBluetoothCharacteristics representing the data and control point
  Monitor the state property and use the function sendFirmware() to send a DFU zip.
**/
class StateMachine {

  constructor (webBluetoothControlPoint, webBluetoothPacketPoint) {
    this.setControlPoint(webBluetoothControlPoint)
    this.setPacketPoint(webBluetoothPacketPoint)
    /** TODO: The queue should have better error reporting which are tied to state */
    this.fileTransfers = queue(Transfer.Worker, 1)
    if (this.controlpointCharacteristic && this.packetCharacteristic) {
      this.state = StateMachineStates.IDLE
    } else {
      this.state = StateMachineStates.NOT_CONFIGURED
    }
  }

  setControlPoint (webBluetoothCharacteristic) {
    this.controlpointCharacteristic = webBluetoothCharacteristic
  }

  setPacketPoint (webBluetoothCharacteristic) {
    this.packetCharacteristic = webBluetoothCharacteristic
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
      this.addTransfer(new Transfer(section.dat, this.controlpointCharacteristic, this.packetCharacteristic, TransferObjectType.Command))
      this.addTransfer(new Transfer(section.bin, this.controlpointCharacteristic, this.packetCharacteristic, TransferObjectType.Data))
    }
  }

}

module.exports.States = StateMachineStates
module.exports.StateMachine = StateMachine
