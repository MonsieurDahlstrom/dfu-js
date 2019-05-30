'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2017 Monsieur Dahlström Ltd
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
Main Facade class to the library
  Create StateMachine with WebBluetoothCharacteristics representing the data and control point
  Monitor the state property and use the function sendFirmware() to send a DFU zip.
**/

var stateSymbol = Symbol();
var controlPointSymbol = Symbol();
var packetPointSymbol = Symbol();
var transfersSymbol = Symbol();
var queueSymbol = Symbol();
var progressSymbol = Symbol();

var StateMachine = function (_EventEmitter) {
  _inherits(StateMachine, _EventEmitter);

  function StateMachine(webBluetoothControlPoint, webBluetoothPacketPoint) {
    _classCallCheck(this, StateMachine);

    var _this = _possibleConstructorReturn(this, (StateMachine.__proto__ || Object.getPrototypeOf(StateMachine)).call(this));

    _this[controlPointSymbol] = webBluetoothControlPoint;
    _this[packetPointSymbol] = webBluetoothPacketPoint;
    if (_this[controlPointSymbol] !== undefined && _this[packetPointSymbol] !== undefined) {
      _this[stateSymbol] = _states2.default.IDLE;
    } else {
      _this[stateSymbol] = _states2.default.NOT_CONFIGURED;
    }
    _this[transfersSymbol] = [];
    _this[queueSymbol] = (0, _queue2.default)(_transfer.TransferWorker, 1);
    _this[queueSymbol].error(_this.onTransferError);
    _this[progressSymbol] = { completed: 0.0, size: 1.0 };
    return _this;
  }

  _createClass(StateMachine, [{
    key: 'onTransferError',
    value: function onTransferError(error, transfer) {
      console.error(error);
    }

    /** get/set **/

  }, {
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
            for (var _iterator = this.transfers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
    /**
      Internal method used to slot each part of a dfu zip for transfer to device
    **/

  }, {
    key: 'addTransfer',
    value: function addTransfer(transfer) {
      var _this2 = this;

      this.transfers.push(transfer);
      this.queue.push(transfer, function (error) {
        if (error || transfer.state === _states2.default.FAILED) {
          _this2.queue.kill();
          _this2.state = _states2.default.FAILED;
        } else if (_this2.queue.length() === 0) {
          _this2.state = _states2.default.COMPLETE;
        }
      });
    }
    /**
      Send a firmware to a device. Throws when parameter or state is invalid for sending a firmware
    **/

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
        for (var _iterator2 = firmware.sections[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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
    /** get/set **/

  }, {
    key: 'controlPoint',
    get: function get() {
      return this[controlPointSymbol];
    },
    set: function set(webBluetoothCharacteristic) {
      this[controlPointSymbol] = webBluetoothCharacteristic;
      if (this.state === _states2.default.NOT_CONFIGURED && this[controlPointSymbol] != null && this[packetPointSymbol] != null) {
        this.state = _states2.default.IDLE;
      } else if (this.state === _states2.default.IDLE && (this[controlPointSymbol] == null || this[packetPointSymbol] == null)) {
        this.state = _states2.default.NOT_CONFIGURED;
      }
    }

    /** get/set **/

  }, {
    key: 'packetPoint',
    get: function get() {
      return this[packetPointSymbol];
    },
    set: function set(webBluetoothCharacteristic) {
      this[packetPointSymbol] = webBluetoothCharacteristic;
      if (this.state === _states2.default.NOT_CONFIGURED && this[controlPointSymbol] != null && this[packetPointSymbol] != null) {
        this.state = _states2.default.IDLE;
      } else if (this.state === _states2.default.IDLE && (this[controlPointSymbol] == null || this[packetPointSymbol] == null)) {
        this.state = _states2.default.NOT_CONFIGURED;
      }
    }

    /** get/set **/

  }, {
    key: 'transfers',
    get: function get() {
      return this[transfersSymbol];
    }

    /** get/set **/

  }, {
    key: 'progress',
    get: function get() {
      return this[progressSymbol];
    }

    /** get/set **/

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