'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _firmware = require('../firmware');

var _transfer = require('../transfer');

var _task = require('../task');

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stateSymbol = (0, _symbol2.default)();
var controlPointSymbol = (0, _symbol2.default)();
var packetPointSymbol = (0, _symbol2.default)();
var transfersSymbol = (0, _symbol2.default)();
var queueSymbol = (0, _symbol2.default)();
var progressSymbol = (0, _symbol2.default)();

var StateMachine = function (_EventEmitter) {
  (0, _inherits3.default)(StateMachine, _EventEmitter);

  function StateMachine(webBluetoothControlPoint, webBluetoothPacketPoint) {
    (0, _classCallCheck3.default)(this, StateMachine);

    var _this = (0, _possibleConstructorReturn3.default)(this, (StateMachine.__proto__ || (0, _getPrototypeOf2.default)(StateMachine)).call(this));

    _this[controlPointSymbol] = webBluetoothControlPoint;
    _this[packetPointSymbol] = webBluetoothPacketPoint;
    if (_this[controlPointSymbol] !== undefined && _this[packetPointSymbol] !== undefined) {
      _this[stateSymbol] = _states2.default.IDLE;
    } else {
      _this[stateSymbol] = _states2.default.NOT_CONFIGURED;
    }
    _this[transfersSymbol] = [];
    _this[queueSymbol] = (0, _queue2.default)(_transfer.TransferWorker, 1);
    _this[progressSymbol] = { completed: 0.0, size: 1.0 };
    return _this;
  }

  (0, _createClass3.default)(StateMachine, [{
    key: 'calculateProgress',
    value: function calculateProgress() {
      switch (this.state) {
        case _states2.default.NOT_CONFIGURED:
          this[progressSymbol].completed = 0.0;
          break;
        case _states2.default.IDLE:
          this[progressSymbol].completed = 0.0;
          break;
        case _states2.default.COMPLETE:
          this[progressSymbol].completed = this[progressSymbol].size;
          break;
        case _states2.default.FAILED:
          this[progressSymbol].completed = this[progressSymbol].size;
          break;
        case _states2.default.TRANSFERING:
          var progress = 0;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = (0, _getIterator3.default)(this.transfers), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var transfer = _step.value;

              switch (transfer.state) {
                case _transfer.TransferStates.Completed:
                  progress += transfer.file.length;
                case _transfer.TransferStates.Transfer:
                  progress += transfer.file.length * transfer.progress;
                default:
                  progress += 0;
                  break;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          this[progressSymbol].completed = progress;
          break;
      }
      this.emit('progressChanged', { dfuStateMachine: this, progress: this[progressSymbol] });
    }
  }, {
    key: 'addTransfer',
    value: function addTransfer(transfer) {
      var _this2 = this;

      this.transfers.push(transfer);
      this.queue.push(transfer, function (error) {
        if (error) {
          _this2.queue.kill();
          _this2.state = _states2.default.FAILED;
        } else if (transfer.state === _states2.default.FAILED) {
          _this2.queue.kill();
          _this2.state = _states2.default.FAILED;
        } else if (_this2.queue.length() === 0) {
          _this2.state = _states2.default.COMPLETE;
        }
      });
    }
  }, {
    key: 'sendFirmware',
    value: function sendFirmware(firmware) {
      var _this3 = this;

      if (this.state === _states2.default.NOT_CONFIGURED) {
        throw new Error('StateMachine is not configured with bluetooth characteristics');
      }
      if (this.state !== _states2.default.IDLE) {
        throw new Error('Can only initate transfer when idle');
      }
      if (firmware instanceof _firmware.Firmware === false) {
        throw new Error('Firmware needs to be of class Firmware');
      }
      var updateFunc = function updateFunc(event) {
        _this3.calculateProgress();
      };
      var firmwareSize = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(firmware.sections), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var section = _step2.value;

          var datTransfer = new _transfer.Transfer(section.dat, this.controlPoint, this.packetPoint, _transfer.TransferTypes.Command);
          datTransfer.on('progressChanged', updateFunc);
          var binTransfer = new _transfer.Transfer(section.bin, this.controlPoint, this.packetPoint, _transfer.TransferTypes.Data);
          binTransfer.on('progressChanged', updateFunc);
          this.addTransfer(datTransfer);
          this.addTransfer(binTransfer);
          firmwareSize += section.dat.length;
          firmwareSize += section.bin.length;
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this[progressSymbol].completed = 0;
      this[progressSymbol].size = firmwareSize;
      this.state = _states2.default.TRANSFERING;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.queue.kill();
      this.state = _states2.default.IDLE;
    }
  }, {
    key: 'state',
    get: function get() {
      return this[stateSymbol];
    },
    set: function set(value) {
      if (value !== this[stateSymbol]) {
        this[stateSymbol] = value;
        this.emit('stateChanged', { dfuStateMachine: this, state: value });
      }
    }
  }, {
    key: 'controlPoint',
    get: function get() {
      return this[controlPointSymbol];
    },
    set: function set(webBluetoothCharacteristic) {
      this[controlPointSymbol] = webBluetoothCharacteristic;
      if (this.state === _states2.default.NOT_CONFIGURED && this[controlPointSymbol] !== undefined && this[packetPointSymbol] !== undefined) {
        this.state = _states2.default.IDLE;
      } else if (this.state === _states2.default.IDLE && (this[controlPointSymbol] === undefined || this[packetPointSymbol] === undefined)) {
        this.state = _states2.default.NOT_CONFIGURED;
      }
    }
  }, {
    key: 'packetPoint',
    get: function get() {
      return this[packetPointSymbol];
    },
    set: function set(webBluetoothCharacteristic) {
      this[packetPointSymbol] = webBluetoothCharacteristic;
      if (this.state === _states2.default.NOT_CONFIGURED && this[controlPointSymbol] !== undefined && this[packetPointSymbol] !== undefined) {
        this.state = _states2.default.IDLE;
      } else if (this.state === _states2.default.IDLE && (this[controlPointSymbol] === undefined || this[packetPointSymbol] === undefined)) {
        this.state = _states2.default.NOT_CONFIGURED;
      }
    }
  }, {
    key: 'transfers',
    get: function get() {
      return this[transfersSymbol];
    }
  }, {
    key: 'progress',
    get: function get() {
      return this[progressSymbol];
    }
  }, {
    key: 'queue',
    get: function get() {
      return this[queueSymbol];
    }
  }]);
  return StateMachine;
}(_events2.default);

module.exports.DFUStateMachineStates = _states2.default;
module.exports.DFUStateMachine = StateMachine;
//# sourceMappingURL=index.js.map