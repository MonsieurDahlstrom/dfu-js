import {factory, ObjectAdapter} from 'factory-girl'
factory.setAdapter(new ObjectAdapter())
//
import TransferFactory from './transfer-factory'
import WebBluetoothMockFactories from './web-bluetooth'
import DFUObjectFactory from './dfu-object-factory'

WebBluetoothMockFactories.factories(factory)
DFUObjectFactory.factories(factory)
TransferFactory.factories(factory)

export default factory
