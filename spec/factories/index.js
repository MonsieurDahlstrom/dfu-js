import factory from 'factory-girl';
//
import TransferFactory from './transfer-factory'
import WebBluetoothMockFactories from './web-bluetooth'

TransferFactory.factories(factory)
WebBluetoothMockFactories.factories(factory)

export default factory
