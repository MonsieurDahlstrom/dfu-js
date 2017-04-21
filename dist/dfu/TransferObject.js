'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _Task = require('./Task');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Copyright (c) 2017 Monsieur Dahlström Ltd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var DATA_CHUNK_SIZE = 20;

/** Different states a TransferObject can be in **/
var TransferObjectState = {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
};

/**
NRF51/52 can not process a a whole binary file in one go,
the transfer of a full binary file is done by creating a string of TransferObjects
with a maximum size that the MCU reports via bluewooth
**/

var TransferObject = function () {
  function TransferObject(offset, length, transfer, transferType, onCompletitionCallback) {
    (0, _classCallCheck3.default)(this, TransferObject);

    // function to call when transfer completes or fails
    this.onCompletition = onCompletitionCallback;
    // Reference to parent transfer that stores the file data
    this.parentTransfer = transfer;
    // The offset into the file data
    this.parentOffset = offset;
    // How long this object is
    this.objectLength = length;
    // TransferObjectType for this transfer object
    this.objectType = transferType;
    // Initial state
    this.state = TransferObjectState.NotStarted;
  }

  /**
    Internal convinence methods, a transfer object might have been partially
    transfered already, if so the offset passed in is none zero.
      Based on the offset and length into the Transfer objects file and the given
    offset in this range, create the number of chunks needed.
  **/


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

    /** The first step in transferring this object, ask how much has already been transferred **/

  }, {
    key: 'begin',
    value: function begin() {
      this.state = TransferObjectState.Creating;
      this.parentTransfer.addTask(_Task.Task.verify(this.objectType, this.parentTransfer.controlPoint));
    }

    /** internal convinence method, extract how much of an object that has already been transfered **/

  }, {
    key: 'verify',
    value: function verify(dataView) {
      var currentOffset = dataView.getUint32(7, true);
      var currentCRC = dataView.getUint32(11, true);
      this.validate(currentOffset, currentCRC);
    }

    /** convinence, returns a boolean for if a specific offset represents this object **/

  }, {
    key: 'hasOffset',
    value: function hasOffset(offset) {
      var min = this.parentOffset;
      var max = min + this.objectLength;
      return offset >= min && offset <= max;
    }

    /** Given an offset & checksum, take the appropirate next action **/

  }, {
    key: 'validate',
    value: function validate(offset, checksum) {
      /** The checksum reported back from a NRF51/52 is a crc of the Transfer object's file up till the offset */
      var fileCRCToOffset = _crc2.default.crc32(this.parentTransfer.file.slice(0, offset));
      if (offset === this.parentOffset + this.objectLength && checksum === fileCRCToOffset) {
        /** Object has been transfered and should be moved into its right place on the device **/
        this.state = TransferObjectState.Storing;
        var operation = _Task.Task.execute(this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(operation);
      } else if (offset === this.parentOffset || offset > this.parentOffset + this.objectLength || checksum !== fileCRCToOffset) {
        /** This object has not been trasnfered to the device or is faulty, recreate and transfer a new **/
        this.state = TransferObjectState.Creating;
        var _operation = _Task.Task.create(this.objectType, this.objectLength, this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(_operation);
      } else {
        /** its the right object on the device but it has not been transfred fully **/
        this.state = TransferObjectState.Transfering;
        this.toPackets(offset);
        this.parentTransfer.addTask(this.setPacketReturnNotification());
        this.transfer();
      }
    }

    /** Slots all data chunks for transmission, the queue inside Transfer ensures the order **/

  }, {
    key: 'transfer',
    value: function transfer() {
      for (var index = 0; index < this.chunks.length; index++) {
        var buffer = this.chunks[index].buffer;
        this.parentTransfer.addTask(_Task.Task.writePackage(buffer, this.parentTransfer.packetPoint));
      }
    }

    /** Request a notification when all packets for this transferObject has been received on the device **/

  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return _Task.Task.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint);
    }

    /** handles events received on the Control Point Characteristic **/

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
      this.toPackets(0);
      this.parentTransfer.addTask(this.setPacketReturnNotification());
      this.transfer();
    }
  }, {
    key: 'onChecksum',
    value: function onChecksum(dataView) {
      /** verify how much how the transfer that has been completed */
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