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
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _results = require('./results');

var _results2 = _interopRequireDefault(_results);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Task = function () {
  function Task(characteristicToWriteTo, bytesToWrite, commandToExecute) {
    _classCallCheck(this, Task);

    this.opcode = commandToExecute;
    this.buffer = bytesToWrite;
    this.characteristic = characteristicToWriteTo;
  }

  _createClass(Task, null, [{
    key: 'Worker',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(task, onCompleition) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
                onCompleition();
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
      dataView.setUint8(0, _types2.default.SELECT);
      dataView.setUint8(1, objectType);
      return new Task(characteristic, dataView.buffer, _types2.default.SELECT);
    }
  }, {
    key: 'create',
    value: function create(objectType, length, characteristic) {
      var dataView = new DataView(new ArrayBuffer(6));
      dataView.setUint8(0, _types2.default.CREATE);
      dataView.setUint8(1, objectType);
      /** Data length set to little endian converstion */
      dataView.setUint32(2, length, true);
      return new Task(characteristic, dataView.buffer, _types2.default.CREATE);
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification(packageCount, characteristic) {
      var dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint8(0, _types2.default.SET_PRN);
      /** Set the package received notification to the number of expected packages */
      dataView.setUint16(1, packageCount, true);
      return new Task(characteristic, dataView.buffer, _types2.default.SET_PRN);
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
      dataView.setUint8(0, _types2.default.CALCULATE_CHECKSUM);
      return new Task(characteristic, dataView.buffer, _types2.default.CALCULATE_CHECKSUM);
    }
  }, {
    key: 'execute',
    value: function execute(characteristic) {
      var dataView = new DataView(new ArrayBuffer(1));
      dataView.setUint8(0, _types2.default.EXECUTE);
      return new Task(characteristic, dataView.buffer, _types2.default.EXECUTE);
    }
  }]);

  return Task;
}();

module.exports.Task = Task;
module.exports.TaskTypes = _types2.default;
module.exports.TaskResults = _results2.default;