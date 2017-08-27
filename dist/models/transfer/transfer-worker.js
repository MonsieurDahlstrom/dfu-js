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
  task.begin();
  var intervalTimer = setInterval(function () {
    if (task.state === _states2.default.Failed) {
      clearInterval(intervalTimer);
      task.end();
      currentTransfer = undefined;
      onCompleition('Failed Transfer');
    } else if (task.state === _states2.default.Completed) {
      clearInterval(intervalTimer);
      task.end();
      currentTransfer = undefined;
      onCompleition();
    }
  }, 500);
};

module.exports.CurrentTransfer = CurrentTransfer;
module.exports.TransferWorker = TransferWorker;
//# sourceMappingURL=transfer-worker.js.map