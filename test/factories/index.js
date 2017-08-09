import {factory, ObjectAdapter} from 'factory-girl'
factory.setAdapter(new ObjectAdapter());
//
import {Transfer} from '../../src/models/transfer'
import {TransferObject} from '../../src/models/transfer-object'
import WebBluetoothCharacteristicMock from './web-bluetooth-characteristic-mock'
import Write from '../../src/models/write'

factory.define('transfer', Transfer, {
  packetPoint: factory.assoc('webBluetoothCharacteristic'),
  controlPoint: factory.assoc('webBluetoothCharacteristic'),
  file: () => Array.from({length: 25}, () => Math.floor(Math.random() * 9))
});

factory.define('transferObject', TransferObject, {
  offset: 0,
  length:  20,
  transfer: factory.assoc('transfer'),
  onCompletition: () =>  function() {},
  transferType: () => (Math.random() <= 0.5) === true ? 1 : 2,
});

factory.define('webBluetoothCharacteristic', WebBluetoothCharacteristicMock, {
});

factory.define('writeChecksum', Write.Checksum, {
  characteristic: factory.assoc('webBluetoothCharacteristic'),
  buffer: () => {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, Write.Actions.CALCULATE_CHECKSUM)
    return dataView.buffer
  }
});

export default factory
