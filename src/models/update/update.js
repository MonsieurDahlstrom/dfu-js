import UpdateStates from './update-states'

export default class Update {

  constructor (deviceID, webBluetoothControlPoint, webBluetoothPacketPoint) {
    this.identifier = deviceID
    this.state = UpdateStates.NOT_CONFIGURED
    this.setControlPoint(webBluetoothControlPoint)
    this.setPacketPoint(webBluetoothPacketPoint)
    this.transfers = []
  }

  setDeviceIdentifier (newIdentifier) {
    this.identifier = newIdentifier
  }
  
  setControlPoint (webBluetoothCharacteristic) {
    this.controlpointCharacteristic = webBluetoothCharacteristic
    if (this.state === UpdateStates.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
      this.state = UpdateStates.IDLE
    }
  }

  setPacketPoint (webBluetoothCharacteristic) {
    this.packetCharacteristic = webBluetoothCharacteristic
    if (this.state === UpdateStates.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
      this.state = UpdateStates.IDLE
    }
  }


}
