import {factory, ObjectAdapter} from 'factory-girl'
factory.setAdapter(new ObjectAdapter());
//
import {Update, UpdateStates} from '../../src/models/update'
import {Transfer} from '../../src/models/transfer'
import {TransferObject} from '../../src/models/transfer-object'

import WebBluetoothCharacteristicMock from './web-bluetooth-characteristic-mock'
import WebBluetoothDeviceMock from './web-bluetooth-device-mock'
import WebBluetoothServiceMock from './web-bluetooth-service-mock'
import WebBluetoothGattMock from './web-bluetooth-gatt-mock'

import Write from '../../src/models/write'

factory.define('update', Update, {
  state: UpdateStates.NOT_CONFIGURED
})

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

factory.define('writeChecksum', Write.Checksum, {
  characteristic: factory.assoc('webBluetoothCharacteristic'),
  buffer: () => {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, Write.Actions.CALCULATE_CHECKSUM)
    return dataView.buffer
  }
});

factory.define('webBluetoothDevice', WebBluetoothDeviceMock, {
  id: factory.chance('string'),
  name: factory.chance('name'),
  gatt: factory.assoc('webBluetoothGatt')
});

factory.define('webBluetoothGatt', WebBluetoothGattMock, {
  dfuService: factory.assoc('webBluetoothDFU')
});

factory.define('webBluetoothDFU', WebBluetoothServiceMock, {
  controlpointCharacteristic: () =>   factory.assoc('webBluetoothCharacteristic'),
  packetCharacteristic: () =>   factory.assoc('webBluetoothCharacteristic')
});

factory.define('webBluetoothCharacteristic', WebBluetoothCharacteristicMock, {
});

export default factory
