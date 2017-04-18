'use strict';

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
}; // import {WWSecureDFUObject} from './types'

var StateMachine = function () {
  function StateMachine(webBluetoothControlPoint, webBluetoothPacketPoint) {
    (0, _classCallCheck3.default)(this, StateMachine);

    this.setControlPoint(webBluetoothControlPoint);
    this.setPacketPoint(webBluetoothPacketPoint);
    this.fileTransfers = (0, _queue2.default)(_dfu.Transfer.Worker, 1);
    if (this.controlpointCharacteristic && this.packetCharacteristic) {
      this.state = StateMachineStates.IDLE;
    } else {
      this.state = StateMachineStates.NOT_CONFIGURED;
    }
  }

  (0, _createClass3.default)(StateMachine, [{
    key: 'setControlPoint',
    value: function setControlPoint(webBluetoothCharacteristic) {
      this.controlpointCharacteristic = webBluetoothCharacteristic;
    }
  }, {
    key: 'setPacketPoint',
    value: function setPacketPoint(webBluetoothCharacteristic) {
      this.packetCharacteristic = webBluetoothCharacteristic;
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
        throw new Error("StateMachine is not configured with bluetooth characteristics");
      }
      if (this.state !== StateMachineStates.IDLE) {
        throw new Error("Can only initate transfer when idle");
      }
      if (firmware instanceof _firmware.Firmware === false) {
        throw new Error("Firmware needs to be of class Firmware");
      }
      this.addTransfer(new _dfu.Transfer(firmware.sections[0].dat, this, this.packetCharacteristic, this.controlpointCharacteristic, _dfu.TransferObjectType.Command));
      this.addTransfer(new _dfu.Transfer(firmware.sections[0].bin, this, this.packetCharacteristic, this.controlpointCharacteristic, _dfu.TransferObjectType.Data));
    }
  }]);
  return StateMachine;
}();

module.exports.States = StateMachineStates;
module.exports.StateMachine = StateMachine;