'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _firmware = require('./firmware');

var _dfu = require('./dfu');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StateMachineStates = {
  NOT_CONFIGURED: 0x00,
  IDLE: 0x01,
  TRANSFERING: 0x02,
  COMPLETE: 0x03,
  FAILED: 0x04
};

var StateMachine = function () {
  function StateMachine(webBluetoothControlPoint, webBluetoothPacketPoint) {
    (0, _classCallCheck3.default)(this, StateMachine);

    this._state = StateMachineStates.NOT_CONFIGURED;
    Object.defineProperty(this, "state", {
      get: function get() {
        return this._state;
      },
      set: function set(value) {
        this._state = value;
        if (this.delegate !== undefined) {
          this.delegate.updateStateMachine();
        }
      },
      configurable: true
    });
    this.setControlPoint(webBluetoothControlPoint);
    this.setPacketPoint(webBluetoothPacketPoint);

    this.fileTransfers = (0, _queue2.default)(_dfu.TransferWorker, 1);
    if (this.controlpointCharacteristic && this.packetCharacteristic) {
      this.state = StateMachineStates.IDLE;
    }
  }

  (0, _createClass3.default)(StateMachine, [{
    key: 'setDelegate',
    value: function setDelegate(delegate) {
      this.delegate = delegate;
    }
  }, {
    key: 'setControlPoint',
    value: function setControlPoint(webBluetoothCharacteristic) {
      this.controlpointCharacteristic = webBluetoothCharacteristic;
      if (this.state === StateMachineStates.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
        this.state = StateMachineStates.IDLE;
      }
    }
  }, {
    key: 'setPacketPoint',
    value: function setPacketPoint(webBluetoothCharacteristic) {
      this.packetCharacteristic = webBluetoothCharacteristic;
      if (this.state === StateMachineStates.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
        this.state = StateMachineStates.IDLE;
      }
    }
  }, {
    key: 'progress',
    value: function progress() {
      switch (this.state) {
        case StateMachineStates.NOT_CONFIGURED:
          return 0.0;
        case StateMachineStates.IDLE:
          return 0.0;
        case StateMachineStates.COMPLETE:
          return 1.0;
        case StateMachineStates.FAILED:
          return 1.0;
        case StateMachineStates.TRANSFERING:
          if (_dfu.CurrentTransfer !== undefined) {
            return _dfu.CurrentTransfer.progress();
          } else {
            console.error('DFU StateMachine is in State Transfering but no transfer is set');
            return 0.0;
          }
      }
    }
  }, {
    key: 'addTransfer',
    value: function addTransfer(transfer) {
      var _this = this;

      this.fileTransfers.push(transfer, function (error) {
        if (error) {
          _this.fileTransfers.kill();
        }
      });
    }
  }, {
    key: 'sendFirmware',
    value: function sendFirmware(firmware) {
      if (this.state === StateMachineStates.NOT_CONFIGURED) {
        throw new Error('StateMachine is not configured with bluetooth characteristics');
      }
      if (this.state !== StateMachineStates.IDLE) {
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

          this.addTransfer(new _dfu.Transfer(section.dat, this.controlpointCharacteristic, this.packetCharacteristic, _dfu.TransferObjectType.Command));
          this.addTransfer(new _dfu.Transfer(section.bin, this.controlpointCharacteristic, this.packetCharacteristic, _dfu.TransferObjectType.Data));
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
  }]);
  return StateMachine;
}();

module.exports.States = StateMachineStates;
module.exports.StateMachine = StateMachine;
//# sourceMappingURL=state-machine.js.map