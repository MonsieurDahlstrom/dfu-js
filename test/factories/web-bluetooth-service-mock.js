const DFU_CHAR_BASE = '8ec9xxxx-f315-4f60-9fb8-838830daea50'
// Control Point is notify, write
export const DFUSecureControlPoint = DFU_CHAR_BASE.replace('xxxx', '0001')
// Packet is Write No Response
export const DFUSecurePacket = DFU_CHAR_BASE.replace('xxxx', '0002')

export default class WebBluetoothGatteMock {

  constructor() {
  }

  async getCharacteristic(uuid) {
    if(uuid === DFUSecureControlPoint) {
      return this.controlpointCharacteristic
    } else if (uuid === DFUSecurePacket) {
      return this.packetCharacteristic
    }
  }

}
