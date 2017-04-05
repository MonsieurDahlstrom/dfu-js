// import {WWSecureDFUObject} from './types'
import queue from 'async/queue'
import {Firmware, FirmwareType} from './firmware'
import {Transfer,TransferState} from './dfu'

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
    if(this.state !== StateMachineStates.IDLE) {
      throw Error("Can only initate transfer of firmare when idle");
    }
    if(firmware instanceof Firmware === false) {
      throw Error("Expect firmware parameter to be of class Firmware");
    }
    this.addTransfer(new DFUTransfer(firmware.sections[0].dat, this, this.packetCharacteristic, this.controlpointCharacteristic, WWSecureDFUObject.COMMAND))
    this.addTransfer(new DFUTransfer(firmware.sections[0].bin, this, this.packetCharacteristic, this.controlpointCharacteristic, WWSecureDFUObject.DATA))
  }
}

module.exports.States = StateMachineStates
module.exports.StateMachine = StateMachine
