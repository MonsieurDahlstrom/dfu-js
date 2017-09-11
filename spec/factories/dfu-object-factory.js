
import {DFUObject, DFUObjectStates} from '../../src/models/dfu-object'
import {TransferTypes} from '../../src/models/transfer'

export default {
  factories: function(factory) {
    factory.define('dfuObject', DFUObject, {
      state:DFUObjectStates.NotStarted,
      transfer: factory.assoc("transfer"),
      offset: 0,
      length: 128,
      //packetPoint: factory.assoc('webBluetoothCharacteristic'),
      //controlPoint: factory.assoc('webBluetoothCharacteristic'),
      //file: Array.from({length: 255}, () => Math.floor(Math.random() * 9)),
      type: TransferTypes.Command,
      //tasks: queue(Task.Worker, 1)
    });
  }
}
