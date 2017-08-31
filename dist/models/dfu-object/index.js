'use strict';

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

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _task = require('../task');

var _states = require('./states.js');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATA_CHUNK_SIZE = 20;

var lengthSymbol = (0, _symbol2.default)();
var typeSymbol = (0, _symbol2.default)();
var offsetSymbol = (0, _symbol2.default)();
var transferSymbol = (0, _symbol2.default)();
var stateSymbol = (0, _symbol2.default)();

var DFUObject = function (_EventEmitter) {
  (0, _inherits3.default)(DFUObject, _EventEmitter);

  function DFUObject(offset, length, transfer, transferType) {
    (0, _classCallCheck3.default)(this, DFUObject);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DFUObject.__proto__ || (0, _getPrototypeOf2.default)(DFUObject)).call(this));

    _this[transferSymbol] = transfer;

    _this[offsetSymbol] = offset;

    _this[lengthSymbol] = length;

    _this[typeSymbol] = transferType;

    _this[stateSymbol] = _states2.default.NotStarted;
    return _this;
  }

  (0, _createClass3.default)(DFUObject, [{
    key: 'toPackets',
    value: function toPackets(offset) {
      this.chunks = [];
      var parentFileEnd = this.offset + this.length;
      var parentFileBegin = this.offset + offset;
      var index = parentFileBegin;
      while (index < parentFileEnd) {
        var chunkBegin = index;
        var chunkEnd = chunkBegin + DATA_CHUNK_SIZE < parentFileEnd ? chunkBegin + DATA_CHUNK_SIZE : chunkBegin + (parentFileEnd - index);
        var chunk = this.transfer.file.slice(chunkBegin, chunkEnd);
        this.chunks.push(chunk);
        index += DATA_CHUNK_SIZE;
      }
    }
  }, {
    key: 'begin',
    value: function begin() {
      this.state = _states2.default.Creating;
      this.transfer.addTask(_task.Task.verify(this.type, this.transfer.controlPoint));
    }
  }, {
    key: 'verify',
    value: function verify(dataView) {
      var currentOffset = dataView.getUint32(7, true);
      var currentCRC = dataView.getUint32(11, true);
      this.validate(currentOffset, currentCRC);
    }
  }, {
    key: 'hasOffset',
    value: function hasOffset(offset) {
      var min = this.offset;
      var max = min + this.length;
      return offset >= min && offset <= max;
    }
  }, {
    key: 'validate',
    value: function validate(offset, checksum) {
      var fileCRCToOffset = _crc2.default.crc32(this.transfer.file.slice(0, offset));
      if (offset === this.offset + this.length && checksum === fileCRCToOffset) {
        this.state = _states2.default.Storing;
        var operation = _task.Task.execute(this.transfer.controlPoint);
        this.transfer.addTask(operation);
      } else if (offset === this.offset || offset > this.offset + this.length || checksum !== fileCRCToOffset) {
        this.state = _states2.default.Creating;
        var _operation = _task.Task.create(this.type, this.length, this.transfer.controlPoint);
        this.transfer.addTask(_operation);
      } else {
        this.state = _states2.default.Transfering;
        this.toPackets(offset);
        this.transfer.addTask(this.setPacketReturnNotification());
        this.sendChuncks();
      }
    }
  }, {
    key: 'sendChuncks',
    value: function sendChuncks() {
      for (var index = 0; index < this.chunks.length; index++) {
        var buffer = this.chunks[index].buffer;
        this.transfer.addTask(_task.Task.writePackage(buffer, this.transfer.packetPoint));
      }
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return _task.Task.setPacketReturnNotification(this.chunks.length, this.transfer.controlPoint);
    }
  }, {
    key: 'eventHandler',
    value: function eventHandler(dataView) {
      var opCode = dataView.getInt8(1);
      var responseCode = dataView.getInt8(2);
      switch (this.state) {
        case _states2.default.Creating:
          {
            if (opCode === _task.TaskTypes.SELECT && responseCode === _task.TaskResults.SUCCESS) {
              this.onSelect(dataView);
            } else if (opCode === _task.TaskTypes.CREATE && responseCode === _task.TaskResults.SUCCESS) {
              this.onCreate(dataView);
            } else if (opCode === _task.TaskTypes.SET_PRN && responseCode === _task.TaskResults.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              this.state = _states2.default.Failed;
              console.log('DFUObjectStates.Creating  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
        case _states2.default.Transfering:
          {
            if (opCode === _task.TaskTypes.CALCULATE_CHECKSUM && responseCode === _task.TaskResults.SUCCESS) {
              this.onChecksum(dataView);
            } else if (opCode === _task.TaskTypes.SET_PRN && responseCode === _task.TaskResults.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              this.state = _states2.default.Failed;
              console.log('DFUObjectStates.Transfering  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
        case _states2.default.Storing:
          {
            if (opCode === _task.TaskTypes.EXECUTE && responseCode === _task.TaskResults.SUCCESS) {
              this.onExecute();
            } else if (opCode === _task.TaskTypes.SET_PRN && responseCode === _task.TaskResults.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              this.state = _states2.default.Failed;
              console.log('DFUObjectStates.Storing  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
      }
    }
  }, {
    key: 'onSelect',
    value: function onSelect(dataView) {
      this.verify(dataView);
    }
  }, {
    key: 'onCreate',
    value: function onCreate(dataView) {
      this.state = _states2.default.Transfering;

      this.toPackets(0);
      this.transfer.addTask(this.setPacketReturnNotification());
      this.sendChuncks();
    }
  }, {
    key: 'onChecksum',
    value: function onChecksum(dataView) {
      var offset = dataView.getUint32(3, true);
      var checksum = dataView.getUint32(7, true);
      this.validate(offset, checksum);
    }
  }, {
    key: 'onPacketNotification',
    value: function onPacketNotification(dataView) {}
  }, {
    key: 'onExecute',
    value: function onExecute(dataView) {
      this.state = _states2.default.Completed;
    }
  }, {
    key: 'length',
    get: function get() {
      return this[lengthSymbol];
    },
    set: function set(value) {
      this[lengthSymbol] = value;
    }
  }, {
    key: 'type',
    get: function get() {
      return this[typeSymbol];
    },
    set: function set(value) {
      this[typeSymbol] = value;
    }
  }, {
    key: 'offset',
    get: function get() {
      return this[offsetSymbol];
    },
    set: function set(value) {
      this[offsetSymbol] = value;
    }
  }, {
    key: 'transfer',
    get: function get() {
      return this[transferSymbol];
    },
    set: function set(value) {
      this[transferSymbol] = value;
    }
  }, {
    key: 'state',
    get: function get() {
      return this[stateSymbol];
    },
    set: function set(value) {
      if (this[stateSymbol] !== value) {
        this[stateSymbol] = value;
        this.emit('stateChanged', { object: this, state: this[stateSymbol] });
      }
    }
  }]);
  return DFUObject;
}(_events2.default);

module.exports.DFUObject = DFUObject;
module.exports.DFUObjectStates = _states2.default;
//# sourceMappingURL=index.js.map