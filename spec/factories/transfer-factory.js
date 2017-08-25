
import {Transfer, TransferStates, TransferTypes} from '../../src/models/transfer'
import {Task, TaskTypes, TaskResults} from '../../src/models/task'
import queue from 'async/queue'

export default {
  factories: function(factory) {
    factory.define('Transfer', Transfer, {
      state:TransferStates.Prepare,
      packetPoint: factory.assocAttrs('WebBluetoothCharacteristic'),
      controlPoint: factory.assocAttrs('WebBluetoothCharacteristic'),
      stateMachine: undefined,
      file: Array.from({length: 255}, () => Math.floor(Math.random() * 9)),
      objectType: TransferTypes.Command,
      bleTasks: queue(Task.Worker, 1)
    });
  }
}
