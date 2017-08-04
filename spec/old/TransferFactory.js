import factory from 'factory-girl';
import {Transfer,TransferState,TransferObjectType} from '../../src/dfu/transfer'
import {Task,TaskType,TaskResult} from '../../src/dfu/task'

import queue from 'async/queue'

factory.define('Transfer', Transfer, {
  state:TransferState.Prepare,
  packetPoint: factory.assocAttrs('WebBluetoothCharacteristic'),
  controlPoint: factory.assocAttrs('WebBluetoothCharacteristic'),
  stateMachine: undefined,
  file: Array.from({length: 255}, () => Math.floor(Math.random() * 9)),
  objectType: TransferObjectType.Command,
  bleTasks: queue(Task.Worker, 1)
});
