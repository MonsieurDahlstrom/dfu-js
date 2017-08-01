'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _Task = require('./Task');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATA_CHUNK_SIZE = 20;

var TransferObjectState = {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
};

var TransferObject = function () {
  function TransferObject(offset, length, transfer, transferType, onCompletitionCallback) {
    (0, _classCallCheck3.default)(this, TransferObject);

    this.onCompletition = onCompletitionCallback;

    this.parentTransfer = transfer;

    this.parentOffset = offset;

    this.objectLength = length;

    this.objectType = transferType;

    this.state = TransferObjectState.NotStarted;
  }

  (0, _createClass3.default)(TransferObject, [{
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
      this.state = TransferObjectState.Creating;
      this.parentTransfer.addTask(_Task.Task.verify(this.objectType, this.parentTransfer.controlPoint));
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
        this.state = TransferObjectState.Storing;
        var operation = _Task.Task.execute(this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(operation);
      } else if (offset === this.parentOffset || offset > this.parentOffset + this.objectLength || checksum !== fileCRCToOffset) {
        this.state = TransferObjectState.Creating;
        var _operation = _Task.Task.create(this.objectType, this.objectLength, this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(_operation);
      } else {
        this.state = TransferObjectState.Transfering;
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
        this.parentTransfer.addTask(_Task.Task.writePackage(buffer, this.parentTransfer.packetPoint));
      }
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return _Task.Task.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint);
    }
  }, {
    key: 'eventHandler',
    value: function eventHandler(dataView) {
      var opCode = dataView.getInt8(1);
      var responseCode = dataView.getInt8(2);
      switch (this.state) {
        case TransferObjectState.Creating:
          {
            if (opCode === _Task.TaskType.SELECT && responseCode === _Task.TaskResult.SUCCESS) {
              this.onSelect(dataView);
            } else if (opCode === _Task.TaskType.CREATE && responseCode === _Task.TaskResult.SUCCESS) {
              this.onCreate(dataView);
            } else if (opCode === _Task.TaskType.SET_PRN && responseCode === _Task.TaskResult.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
        case TransferObjectState.Transfering:
          {
            if (opCode === _Task.TaskType.CALCULATE_CHECKSUM && responseCode === _Task.TaskResult.SUCCESS) {
              this.onChecksum(dataView);
            } else if (opCode === _Task.TaskType.SET_PRN && responseCode === _Task.TaskResult.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
        case TransferObjectState.Storing:
          {
            if (opCode === _Task.TaskType.EXECUTE && responseCode === _Task.TaskResult.SUCCESS) {
              this.onExecute();
            } else if (opCode === _Task.TaskType.SET_PRN && responseCode === _Task.TaskResult.SUCCESS) {
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
      this.state = TransferObjectState.Transfering;

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
      this.state = TransferObjectState.Completed;
      this.onCompletition();
    }
  }]);
  return TransferObject;
}();

module.exports.TransferObject = TransferObject;
module.exports.TransferObjectState = TransferObjectState;
//# sourceMappingURL=TransferObject.js.map