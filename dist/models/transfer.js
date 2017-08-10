'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _transmissionTypes = require('./transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Transfer = function Transfer(fileData, controlPoint, packetPoint, objectType) {
  (0, _classCallCheck3.default)(this, Transfer);

  this.state = _transmissionTypes2.default.Prepare;

  this.packetPoint = packetPoint;
  this.controlPoint = controlPoint;

  this.file = fileData;

  this.objectType = objectType;

  this.controlPointEventHandler = undefined;

  this.update = undefined;
};

module.exports.Transfer = Transfer;
exports.default = Transfer;
//# sourceMappingURL=transfer.js.map