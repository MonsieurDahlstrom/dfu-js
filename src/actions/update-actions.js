
const UpdateActions = {
  async webBluetoothDFUCreateUpdate({ dispatch, commit }, transferObject) {
  },
  async webBluetoothDFUCancelUpdate({ dispatch, commit }, update) {
  },
  async webBluetoothDFUModifyUpdate({ dispatch, commit }, update) {
  },
  async webBluetoothDFURestoreUpdate({ dispatch, commit }, payload) {
  },
  async webBluetoothDFUSendFirmware({ dispatch, commit }, transferObject) {
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
  },
}

export default UpdateActions
/**
  Send a firmware to a device. Throws when parameter or state is invalid for sending a firmware
**/
sendFirmware (firmware) {

}

addDFU

removeDFU

updateFU

restartDFU
