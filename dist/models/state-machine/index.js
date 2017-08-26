
"use strict";

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

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
var progressSymbol = (0, _symbol2.default)();

var StateMachine = function () {
  function StateMachine(webBluetoothControlPoint, webBluetoothPacketPoint) {
    (0, _classCallCheck3.default)(this, StateMachine);

    this[controlPointSymbol] = webBluetoothControlPoint;
    this[packetPointSymbol] = webBluetoothPacketPoint;
    if (this[controlPointSymbol] !== undefined && this[packetPointSymbol] !== undefined) {
      this[stateSymbol] = _states2.default.IDLE;
    } else {
      this[stateSymbol] = _states2.default.NOT_CONFIGURED;
    }
    this[transfersSymbol] = (0, _queue2.default)(_task.Task.Worker, 1);
    this[progressSymbol] = 0.0;
  }

  (0, _createClass3.default)(StateMachine, [{
    key: 'calculateProgress',
    value: function calculateProgress() {
      switch (this.state) {
        case _states2.default.NOT_CONFIGURED:
          this.progress = 0.0;
          break;
        case _states2.default.IDLE:
          this.progress = 0.0;
          break;
        case _states2.default.COMPLETE:
          this.progress = 1.0;
          break;
        case _states2.default.FAILED:
          this.progress = 1.0;
          break;
        case _states2.default.TRANSFERING:
          if (_transfer.CurrentTransfer !== undefined) {
            _transfer.CurrentTransfer.calculateProgress();
            this.progress = _transfer.CurrentTransfer.progress;
          }
          break;
      }
    }
  }, {
    key: 'addTransfer',
    value: function addTransfer(transfer) {
      var _this = this;

      this.transfers.push(transfer, function (error) {
        transfer.end();
        if (error) {
          _this.transfers.kill();
        }
      });
    }
  }, {
    key: 'sendFirmware',
    value: function sendFirmware(firmware) {
      if (this.state === _states2.default.NOT_CONFIGURED) {
        throw new Error('StateMachine is not configured with bluetooth characteristics');
      }
      if (this.state !== _states2.default.IDLE) {
        throw new Error('Can only initate transfer when idle');
      }
      if (firmware instanceof _firmware.Firmware === false) {
        throw new Error('Firmware needs to be of class Firmware');
      }
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(firmware.sections), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var section = _step.value;

          this.addTransfer(new _transfer.Transfer(section.dat, this.controlPoint, this.packetPoint, _transfer.TransferTypes.Command));
          this.addTransfer(new _transfer.Transfer(section.bin, this.controlPoint, this.packetPoint, _transfer.TransferTypes.Data));
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
    }
  }, {
    key: 'state',
    get: function get() {
      return this[stateSymbol];
    },
    set: function set(value) {
      this[stateSymbol] = value;
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
    },
    set: function set(value) {
      this[transfersSymbol] = value;
    }
  }, {
    key: 'progress',
    get: function get() {
      return this[progressSymbol];
    },
    set: function set(value) {
      this[progressSymbol] = value;
    }
  }]);
  return StateMachine;
}();

module.exports.DFUStateMachineStates = _states2.default;
module.exports.DFUStateMachine = StateMachine;
//# sourceMappingURL=index.js.map