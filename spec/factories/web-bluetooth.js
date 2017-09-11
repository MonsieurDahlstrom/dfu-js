import WebBluetoothCharacteristicMock from './web-bluetooth-characteristic-mock.js'

export default {
  factories: function(factory) {
    factory.define('webBluetoothCharacteristic', WebBluetoothCharacteristicMock, {
    });
  }
}
