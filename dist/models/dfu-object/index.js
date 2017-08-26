
"use strict";

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _task = require('../task');

var _states = require('./states.js');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATA_CHUNK_SIZE = 20;

var DFUObject = function () {
  function DFUObject(offset, length, transfer, transferType, onCompletitionCallback) {
    (0, _classCallCheck3.default)(this, DFUObject);

    this.onCompletition = onCompletitionCallback;

    this.parentTransfer = transfer;

    this.parentOffset = offset;

    this.objectLength = length;

    this.objectType = transferType;

    this.state = _states2.default.NotStarted;
  }

  (0, _createClass3.default)(DFUObject, [{
    key: 'progress',
    value: function progress() {
      switch (this.state) {
        case _states2.default.NotStarted:
          return 0.0;
        case _states2.default.Creating:
          return 0.01;
        case _states2.default.Transfering:
          var difference = this.parentTransfer.bleTasks.length / this.chunks.length;
          switch (difference) {
            case 0:
              return 0.98;
            case 1:
              return 0.02;
            default:
              return 1.0 - difference - 0.02;
          }
        case _states2.default.Storing:
          return 0.99;
        default:
          return 1.0;
      }
    }
  }, {
    key: 'toPackets',
    value: function toPackets(offset) {
      this.chunks = [];
      var parentFileEnd = this.parentOffset + this.objectLength;
      var parentFileBegin = this.parentOffset + offset;
      var index = parentFileBegin;
      while (index < parentFileEnd) {
        var chunkBegin = index;
        var chunkEnd = chunkBegin + DATA_CHUNK_SIZE < parentFileEnd ? chunkBegin + DATA_CHUNK_SIZE : chunkBegin + (parentFileEnd - index);
        var chunk = this.parentTransfer.file.slice(chunkBegin, chunkEnd);
        this.chunks.push(chunk);
        index += DATA_CHUNK_SIZE;
      }
    }
  }, {
    key: 'begin',
    value: function begin() {
      this.state = _states2.default.Creating;
      this.parentTransfer.addTask(_task.Task.verify(this.objectType, this.parentTransfer.controlPoint));
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
      var min = this.parentOffset;
      var max = min + this.objectLength;
      return offset >= min && offset <= max;
    }
  }, {
    key: 'validate',
    value: function validate(offset, checksum) {
      var fileCRCToOffset = _crc2.default.crc32(this.parentTransfer.file.slice(0, offset));
      if (offset === this.parentOffset + this.objectLength && checksum === fileCRCToOffset) {
        this.state = _states2.default.Storing;
        var operation = _task.Task.execute(this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(operation);
      } else if (offset === this.parentOffset || offset > this.parentOffset + this.objectLength || checksum !== fileCRCToOffset) {
        this.state = _states2.default.Creating;
        var _operation = _task.Task.create(this.objectType, this.objectLength, this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(_operation);
      } else {
        this.state = _states2.default.Transfering;
        this.toPackets(offset);
        this.parentTransfer.addTask(this.setPacketReturnNotification());
        this.transfer();
      }
    }
  }, {
    key: 'transfer',
    value: function transfer() {
      for (var index = 0; index < this.chunks.length; index++) {
        var buffer = this.chunks[index].buffer;
        this.parentTransfer.addTask(_task.Task.writePackage(buffer, this.parentTransfer.packetPoint));
      }
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return _task.Task.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint);
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
      this.parentTransfer.addTask(this.setPacketReturnNotification());
      this.transfer();
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
  }]);
  return DFUObject;
}();

module.exports.DFUObject = DFUObject;
module.exports.DFUObjectStates = _states2.default;
//# sourceMappingURL=index.js.map