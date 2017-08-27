
"use strict";

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _task = require('../task');

var _states = require('./states.js');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATA_CHUNK_SIZE = 20;

var lengthSymbol = (0, _symbol2.default)();
var typeSymbol = (0, _symbol2.default)();
var offsetSymbol = (0, _symbol2.default)();
var transferSymbol = (0, _symbol2.default)();
var onCompletitionSymbol = (0, _symbol2.default)();
var stateSymbol = (0, _symbol2.default)();

var DFUObject = function () {
  function DFUObject(offset, length, transfer, transferType, onCompletitionCallback) {
    (0, _classCallCheck3.default)(this, DFUObject);

    this[onCompletitionSymbol] = onCompletitionCallback;

    this[transferSymbol] = transfer;

    this[offsetSymbol] = offset;

    this[lengthSymbol] = length;

    this[typeSymbol] = transferType;

    this[stateSymbol] = _states2.default.NotStarted;
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
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
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
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
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
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
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
      this.onCompletition();
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
    key: 'onCompletition',
    get: function get() {
      return this[onCompletitionSymbol];
    },
    set: function set(value) {
      this[onCompletitionSymbol] = value;
    }
  }, {
    key: 'state',
    get: function get() {
      return this[stateSymbol];
    },
    set: function set(value) {
      this[stateSymbol] = value;
    }
  }]);
  return DFUObject;
}();

module.exports.DFUObject = DFUObject;
module.exports.DFUObjectStates = _states2.default;
//# sourceMappingURL=index.js.map