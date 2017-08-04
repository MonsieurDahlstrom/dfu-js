import factory from 'factory-girl';

function WebBluetoothCharacteristic() {
  return {
    uuid: 0x2A24,
    value: 'Unit51,1,1',
    vservice: undefined,
    addEventListener: function  (key,func) {
    },
    removeEventListener: function  (func) {
    },
    writeValue: function  (valueArray) {
    },
    save: function () {
    }
  }
}

factory.define('WebBluetoothCharacteristic', WebBluetoothCharacteristic, {

});
