import factory from 'factory-girl'
import WebBluetoothCharacteristic from './WebBluetoothCharacteristicFactory'
import * as Write from './../../src/types/write'
import WriteTypes from './../../src/types/write-types'

factory.define('writeChecksum', Write.Checksum, {
  characteristic: factory.build('WebBluetoothCharacteristic'),
  buffer: () => {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, WriteTypes.CALCULATE_CHECKSUM)
    return dataView.buffer
  },
  save: () => { return function () {}}
});
