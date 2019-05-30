
import {Transfer, TransferStates, TransferTypes} from '../../../src/models/transfer'
import {Task, TaskTypes, TaskResults} from '../../../src/models/task'
import queue from 'async/queue'

export default {
  factories: function(factory) {
    factory.define('transfer', Transfer, {
      state:TransferStates.Prepare,
      packetPoint: factory.assoc('webBluetoothCharacteristic'),
      controlPoint: factory.assoc('webBluetoothCharacteristic'),
      file: Array.from({length: 255}, () => Math.floor(Math.random() * 9)),
      type: TransferTypes.Command,
      progress: 0.0
      //tasks: queue(Task.Worker, 1)
    });
  }
}
