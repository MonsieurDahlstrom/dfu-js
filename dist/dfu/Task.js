'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

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

var TaskType = {
  CREATE: 0x01,
  SET_PRN: 0x02,
  CALCULATE_CHECKSUM: 0x03,
  EXECUTE: 0x04,
  SELECT: 0x06,
  RESPONSE_CODE: 0x60
};

var TaskResult = {
  INVALID_CODE: 0x00,
  SUCCESS: 0x01,
  OPCODE_NOT_SUPPORTED: 0x02,
  INVALID_PARAMETER: 0x03,
  INSUFFICIENT_RESOURCES: 0x04,
  INVALID_OBJECT: 0x05,
  UNSUPPORTED_TYPE: 0x07,
  OPERATION_NOT_PERMITTED: 0x08,
  OPERATION_FAILED: 0x0A
};

var Task = function () {
  function Task(characteristicToWriteTo, bytesToWrite, commandToExecute) {
    (0, _classCallCheck3.default)(this, Task);

    this.opcode = commandToExecute;
    this.buffer = bytesToWrite;
    this.characteristic = characteristicToWriteTo;
  }

  (0, _createClass3.default)(Task, null, [{
    key: 'Worker',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(task, onCompleition) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(task instanceof Task === false)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('task not of type Task');

              case 2:
                if (onCompleition) {
                  _context.next = 4;
                  break;
                }

                throw new Error('onCompleition is not set');

              case 4:
                _context.prev = 4;
                _context.next = 7;
                return task.characteristic.writeValue(task.buffer);

              case 7:
                setTimeout(function () {
                  onCompleition();
                }, 100);
                _context.next = 14;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context['catch'](4);

                console.log(_context.t0);
                onCompleition('BLE Transfer Failed');

              case 14:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 10]]);
      }));

      function Worker(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return Worker;
    }()
  }, {
    key: 'verify',
    value: function verify(objectType, characteristic) {
      var dataView = new DataView(new ArrayBuffer(2));
      dataView.setUint8(0, TaskType.SELECT);
      dataView.setUint8(1, objectType);
      return new Task(characteristic, dataView.buffer, TaskType.SELECT);
    }
  }, {
    key: 'create',
    value: function create(objectType, length, characteristic) {
      var dataView = new DataView(new ArrayBuffer(6));
      dataView.setUint8(0, TaskType.CREATE);
      dataView.setUint8(1, objectType);
      /** Data length set to little endian converstion */
      dataView.setUint32(2, length, true);
      return new Task(characteristic, dataView.buffer, TaskType.CREATE);
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification(packageCount, characteristic) {
      var dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint8(0, TaskType.SET_PRN);
      /** Set the package received notification to the number of expected packages */
      dataView.setUint16(1, packageCount, true);
      return new Task(characteristic, dataView.buffer, TaskType.SET_PRN);
    }
  }, {
    key: 'writePackage',
    value: function writePackage(buffer, characteristic) {
      return new Task(characteristic, buffer);
    }
  }, {
    key: 'checksum',
    value: function checksum(characteristic) {
      var dataView = new DataView(new ArrayBuffer(1));
      dataView.setUint8(0, TaskType.CALCULATE_CHECKSUM);
      return new Task(characteristic, dataView.buffer, TaskType.CALCULATE_CHECKSUM);
    }
  }, {
    key: 'execute',
    value: function execute(characteristic) {
      var dataView = new DataView(new ArrayBuffer(1));
      dataView.setUint8(0, TaskType.EXECUTE);
      return new Task(characteristic, dataView.buffer, TaskType.EXECUTE);
    }
  }]);
  return Task;
}();

module.exports.Task = Task;
module.exports.TaskType = TaskType;
module.exports.TaskResult = TaskResult;