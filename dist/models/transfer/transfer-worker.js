'use strict';

var _transfer = require('./transfer');

var _transfer2 = _interopRequireDefault(_transfer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CurrentTransfer = undefined;

var TransferWorker = function TransferWorker(task, onCompleition) {
  if (task instanceof _transfer2.default === false) {
    throw new Error('task is not of type Task');
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set');
  }
  CurrentTransfer = task;
  task.begin();
  var intervalTimer = setInterval(function () {
    if (task.state === TransferState.Failed) {
      clearInterval(intervalTimer);
      task.end();
      CurrentTransfer = undefined;
      onCompleition('Failed Transfer');
    } else if (task.state === TransferState.Completed) {
      clearInterval(intervalTimer);
      task.end();
      CurrentTransfer = undefined;
      onCompleition();
    }
  }, 1000);
};

module.exports.CurrentTransfer = CurrentTransfer;
module.exports.TransferWorker = TransferWorker;
//# sourceMappingURL=transfer-worker.js.map