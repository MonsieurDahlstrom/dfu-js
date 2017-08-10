'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _updateStates = require('./update-states');

var _updateStates2 = _interopRequireDefault(_updateStates);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Update = function () {
  function Update(deviceID, webBluetoothControlPoint, webBluetoothPacketPoint) {
    (0, _classCallCheck3.default)(this, Update);

    this.identifier = deviceID;
    this.state = _updateStates2.default.NOT_CONFIGURED;
    this.setControlPoint(webBluetoothControlPoint);
    this.setPacketPoint(webBluetoothPacketPoint);
    this.transfers = [];
  }

  (0, _createClass3.default)(Update, [{
    key: 'setDeviceIdentifier',
    value: function setDeviceIdentifier(newIdentifier) {
      this.identifier = newIdentifier;
    }
  }, {
    key: 'setControlPoint',
    value: function setControlPoint(webBluetoothCharacteristic) {
      this.controlpointCharacteristic = webBluetoothCharacteristic;
      if (this.state === _updateStates2.default.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
        this.state = _updateStates2.default.IDLE;
      }
    }
  }, {
    key: 'setPacketPoint',
    value: function setPacketPoint(webBluetoothCharacteristic) {
      this.packetCharacteristic = webBluetoothCharacteristic;
      if (this.state === _updateStates2.default.NOT_CONFIGURED && this.controlpointCharacteristic !== undefined && this.packetCharacteristic !== undefined) {
        this.state = _updateStates2.default.IDLE;
      }
    }
  }]);
  return Update;
}();

exports.default = Update;
//# sourceMappingURL=update.js.map