export default class WebBluetoothCharacteristicMock {

  constructor() {
    this.uuid = 0x2A24
    this.value = 'Unit51,1,1'
    this.service =  undefined
  }

  addEventListener (key,func) {
  }

  removeEventListener (func) {
  }

  async writeValue (valueArray) {
    if (valueArray instanceof ArrayBuffer) {
      return true
    } else {
      throw new Error('Invalid Datatype ' + typeof(valueArray) + ' passed')
    }
  }
}
