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
  function TransferObject(dataslice, offset, type, transfer, onCompletition) {
    (0, _classCallCheck3.default)(this, TransferObject);

    this.completitionCB = onCompletition;
    this.parentTransfer = transfer;
    this.state = TransferObjectState.NotStarted;
    this.dataslice = dataslice;
    this.offset = offset;
    this.objectType = type;
    this.crc = _crc2.default.crc32(dataslice);
    this.chunks = [];
    var counter = 0;
    do {
      this.chunks.push(this.dataslice.slice(counter, counter + DATA_CHUNK_SIZE));
      counter += DATA_CHUNK_SIZE;
    } while (this.dataslice.length > counter);
  }

  (0, _createClass3.default)(TransferObject, [{
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
      this.parentTransfer.addTask(this.setPacketReturnNotification());
      this.validate(currentOffset, currentCRC);
    }
  }, {
    key: 'validate',
    value: function validate(offset, checksum) {
      if (offset !== this.offset + this.dataslice.length || checksum !== this.crc) {
        if (offset === 0 || offset > this.offset + this.dataslice.length || checksum !== this.crc) {
          this.state = TransferObjectState.Creating;
          var operation = _Task.Task.create(this.objectType, this.dataslice.length, this.parentTransfer.controlPoint);
          this.parentTransfer.addTask(operation);
        } else {
          this.state = TransferObjectState.Transfering;
          this.transfer(offset);
        }
      } else {
        this.state = TransferObjectState.Storing;
        var _operation = _Task.Task.execute(this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(_operation);
      }
    }
  }, {
    key: 'transfer',
    value: function transfer(offset) {
      for (var index = 0; index < this.chunks.length; index++) {
        var buffer = this.chunks[index].buffer;
        this.parentTransfer.addTask(_Task.Task.writePackage(buffer, this.parentTransfer.packetPoint));
      }
      // this.parentTransfer.addTask(Task.checksum(this.parentTransfer.controlPoint))
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return _Task.Task.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint);
    }
  }, {
    key: 'eventHandler',
    value: function eventHandler(dataView) {
      /** Depending on which state this object is handle the relevent opcodes */
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
      /** verify how much how the transfer that has been completed */
      this.verify(dataView);
    }
  }, {
    key: 'onCreate',
    value: function onCreate(dataView) {
      this.state = TransferObjectState.Transfering;
      /** start the transfer of the object  */
      this.transfer(0);
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
      this.completitionCB();
    }
  }]);
  return TransferObject;
}();

module.exports.TransferObject = TransferObject;
module.exports.TransferObjectState = TransferObjectState;