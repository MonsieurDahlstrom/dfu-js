
export default class Update {

  constructor (deviceID, webBluetoothControlPoint, webBluetoothPacketPoint) {
    this.identifier = deviceID
    this.state = StateMachineStates.NOT_CONFIGURED
    this.setControlPoint(webBluetoothControlPoint)
    this.setPacketPoint(webBluetoothPacketPoint)
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


}
