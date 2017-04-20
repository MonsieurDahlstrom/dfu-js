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
import {Firmware, FirmwareType} from './firmware'
import {Transfer,TransferState, TransferObjectType} from './dfu'

const StateMachineStates = {
  NOT_CONFIGURED: 0x00,
  IDLE: 0x01,
  TRANSFERING: 0x02,
  COMPLETE: 0x03,
  FAILED: 0x04
}

class StateMachine {

  constructor (webBluetoothControlPoint, webBluetoothPacketPoint) {
    this.setControlPoint(webBluetoothControlPoint)
    this.setPacketPoint(webBluetoothPacketPoint)
    this.fileTransfers = queue(Transfer.Worker, 1)
    if(this.controlpointCharacteristic && this.packetCharacteristic) {
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

  addTransfer (transfer) {
    this.fileTransfers.push(transfer, (error) => {
      if (error) {
        this.fileTransfers.kill()
      }
    })
  }

  sendFirmware (firmware) {
    if(this.state === StateMachineStates.NOT_CONFIGURED) {
      throw new Error("StateMachine is not configured with bluetooth characteristics")
    }
    if(this.state !== StateMachineStates.IDLE) {
      throw new Error("Can only initate transfer when idle");
    }
    if(firmware instanceof Firmware === false) {
      throw new Error("Firmware needs to be of class Firmware");
    }
    this.addTransfer(new Transfer(firmware.sections[0].dat, this.packetCharacteristic, this.controlpointCharacteristic, TransferObjectType.Command))
    this.addTransfer(new Transfer(firmware.sections[0].bin, this.packetCharacteristic, this.controlpointCharacteristic, TransferObjectType.Data))
  }

}

module.exports.States = StateMachineStates
module.exports.StateMachine = StateMachine
