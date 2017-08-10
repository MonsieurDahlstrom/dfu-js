'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _write = require('./write');

var WriteActions = _interopRequireWildcard(_write);

var _transmissionTypes = require('./transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TransferObjectType = {
  Command: 0x01,
  Data: 0x02
};

var TransferObjectState = {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
};

var TransferObject = function () {
  function TransferObject(offset, length, transfer, transferType) {
    (0, _classCallCheck3.default)(this, TransferObject);

    this.transfer = transfer;

    this.offset = offset;

    this.length = length;

    this.type = transferType;

    this.state = TransferObjectState.NotStarted;

    this.chunks = [];
  }

  (0, _createClass3.default)(TransferObject, [{
    key: 'hasOffset',
    value: function hasOffset(offset) {
      var min = this.offset;
      var max = min + this.length;
      return offset >= min && offset <= max;
    }
  }]);
  return TransferObject;
}();

module.exports.TransferObject = TransferObject;
module.exports.TransferObjectState = TransferObjectState;
module.exports.TransferObjectType = TransferObjectType;
//# sourceMappingURL=transfer-object.js.map