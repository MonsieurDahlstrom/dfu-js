'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Execute = exports.Checksum = exports.Package = exports.PacketReturnNotification = exports.Create = exports.Verify = exports.Write = undefined;

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _transmissionTypes = require('../transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

var _writeTypes = require('./write-types');

var _writeTypes2 = _interopRequireDefault(_writeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Write = exports.Write = function Write(characteristicToWriteTo, bytesToWrite, commandToExecute) {
  (0, _classCallCheck3.default)(this, Write);

  this.characteristic = characteristicToWriteTo;
  this.bytes = bytesToWrite;
  this.command = commandToExecute;
  this.state = _transmissionTypes2.default.Prepared;
  this.error = undefined;
  this.transferObject = undefined;
};

var Verify = exports.Verify = function (_Write) {
  (0, _inherits3.default)(Verify, _Write);

  function Verify(characteristic, objectType) {
    (0, _classCallCheck3.default)(this, Verify);

    var dataView = new DataView(new ArrayBuffer(2));
    dataView.setUint8(0, _writeTypes2.default.SELECT);
    dataView.setUint8(1, objectType);
    return (0, _possibleConstructorReturn3.default)(this, (Verify.__proto__ || (0, _getPrototypeOf2.default)(Verify)).call(this, characteristic, dataView.buffer, _writeTypes2.default.SELECT));
  }

  return Verify;
}(Write);

var Create = exports.Create = function (_Write2) {
  (0, _inherits3.default)(Create, _Write2);

  function Create(characteristic, objectType, length) {
    (0, _classCallCheck3.default)(this, Create);

    console.log('EFFING CREATE CONSTRUCTOR');
    var dataView = new DataView(new ArrayBuffer(6));
    dataView.setUint8(0, _writeTypes2.default.CREATE);
    dataView.setUint8(1, objectType);

    dataView.setUint32(2, length, true);
    return (0, _possibleConstructorReturn3.default)(this, (Create.__proto__ || (0, _getPrototypeOf2.default)(Create)).call(this, characteristic, dataView.buffer, _writeTypes2.default.CREATE));
  }

  return Create;
}(Write);

var PacketReturnNotification = exports.PacketReturnNotification = function (_Write3) {
  (0, _inherits3.default)(PacketReturnNotification, _Write3);

  function PacketReturnNotification(characteristic, packageCount) {
    (0, _classCallCheck3.default)(this, PacketReturnNotification);

    var dataView = new DataView(new ArrayBuffer(3));
    dataView.setUint8(0, _writeTypes2.default.SET_PRN);

    dataView.setUint16(1, packageCount, true);
    return (0, _possibleConstructorReturn3.default)(this, (PacketReturnNotification.__proto__ || (0, _getPrototypeOf2.default)(PacketReturnNotification)).call(this, characteristic, dataView.buffer, _writeTypes2.default.SET_PRN));
  }

  return PacketReturnNotification;
}(Write);

var Package = exports.Package = function (_Write4) {
  (0, _inherits3.default)(Package, _Write4);

  function Package(characteristic, buffer) {
    (0, _classCallCheck3.default)(this, Package);
    return (0, _possibleConstructorReturn3.default)(this, (Package.__proto__ || (0, _getPrototypeOf2.default)(Package)).call(this, characteristic, buffer, undefined));
  }

  return Package;
}(Write);

var Checksum = exports.Checksum = function (_Write5) {
  (0, _inherits3.default)(Checksum, _Write5);

  function Checksum(characteristic) {
    (0, _classCallCheck3.default)(this, Checksum);

    var dataView = new DataView(new ArrayBuffer(1));
    dataView.setUint8(0, _writeTypes2.default.CALCULATE_CHECKSUM);
    return (0, _possibleConstructorReturn3.default)(this, (Checksum.__proto__ || (0, _getPrototypeOf2.default)(Checksum)).call(this, characteristic, dataView.buffer, _writeTypes2.default.CALCULATE_CHECKSUM));
  }

  return Checksum;
}(Write);

var Execute = exports.Execute = function (_Write6) {
  (0, _inherits3.default)(Execute, _Write6);

  function Execute(characteristic) {
    (0, _classCallCheck3.default)(this, Execute);

    var dataView = new DataView(new ArrayBuffer(1));
    dataView.setUint8(0, _writeTypes2.default.EXECUTE);
    return (0, _possibleConstructorReturn3.default)(this, (Execute.__proto__ || (0, _getPrototypeOf2.default)(Execute)).call(this, characteristic, dataView.buffer, _writeTypes2.default.EXECUTE));
  }

  return Execute;
}(Write);
//# sourceMappingURL=write.js.map