'use strict';

var _transfer = require('./transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var currentTransfer = undefined;

var CurrentTransfer = function CurrentTransfer() {
  return currentTransfer;
};
var TransferWorker = function TransferWorker(task, onCompleition) {
  if (task instanceof _transfer2.default === false) {
    throw new Error('task is not of type Task');
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set');
  }
  currentTransfer = task;
  var stateUpdateFunction = function stateUpdateFunction(event) {
    if (event.state === _states2.default.Failed) {
      onCompleition('transfer failed');
      task.end();
      currentTransfer = undefined;
    } else if (event.state === _states2.default.Completed) {
      task.end();
      currentTransfer = undefined;
      onCompleition();
    }
  };
  currentTransfer.on('stateChanged', stateUpdateFunction);
  currentTransfer.begin();
};

module.exports.CurrentTransfer = CurrentTransfer;
module.exports.TransferWorker = TransferWorker;
//# sourceMappingURL=transfer-worker.js.map