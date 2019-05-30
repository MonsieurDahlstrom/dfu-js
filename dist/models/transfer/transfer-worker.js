'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transfer = require('./transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
Transfer class represents a binary file inside a firmware update zip.
A firmware update consists of a init package and data file. The StateMachine
parases the zip file and creates a transfer object for each entry in the zip

The statemachine uses a queue to slot the Transfers in order
**/
var TransferWorker = function TransferWorker(task, onCompleition) {
  if (task instanceof _transfer2.default === false) {
    throw new Error('task is not of type Task');
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set');
  }
  var stateUpdateFunction = function stateUpdateFunction(event) {
    if (event.state === _states2.default.Failed) {
      task.end();
      onCompleition('transfer failed');
    } else if (event.state === _states2.default.Completed) {
      task.end();
      onCompleition();
    }
  };
  task.on('stateChanged', stateUpdateFunction);
  task.begin();
};

module.exports.TransferWorker = TransferWorker;
exports.default = TransferWorker;