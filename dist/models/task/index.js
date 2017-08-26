
"use strict";

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _results = require('./results');

var _results2 = _interopRequireDefault(_results);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

      dataView.setUint32(2, length, true);
      return new Task(characteristic, dataView.buffer, _types2.default.CREATE);
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification(packageCount, characteristic) {
      var dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint8(0, _types2.default.SET_PRN);

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
//# sourceMappingURL=index.js.map