import WebBluetoothCharacteristic from './WebBluetoothCharacteristicFactory'
import factory from 'factory-girl'
import * as Write from './../../src/types/write'
import WriteTypes from './../../src/types/write-types'

factory.define('writeChecksum', Write.Checksum, {
  characteristic: factory.create('WebBluetoothCharacteristic'),
  buffer: () => {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, WriteTypes.CALCULATE_CHECKSUM)
    return dataView.buffer
  },
  save: () => { return function () {}}
});
