'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _transfer = require('./transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2017 Monsieur Dahlström Ltd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

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