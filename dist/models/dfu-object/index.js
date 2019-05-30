'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _task = require('../task');

var _states = require('./states.js');

var _states2 = _interopRequireDefault(_states);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2017 Monsieur Dahlström Ltd
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

//


var DATA_CHUNK_SIZE = 20;

/**
NRF51/52 can not process a a whole binary file in one go,
the transfer of a full binary file is done by creating a string of TransferObjects
with a maximum size that the MCU reports via bluewooth
**/

var lengthSymbol = Symbol();
var typeSymbol = Symbol();
var offsetSymbol = Symbol();
var transferSymbol = Symbol();
var stateSymbol = Symbol();
var taskQueueSymbol = Symbol();
var progressSymbol = Symbol();

var DFUObject = function (_EventEmitter) {
  _inherits(DFUObject, _EventEmitter);

  function DFUObject(offset, length, transfer, transferType) {
    _classCallCheck(this, DFUObject);

    // Reference to parent transfer that stores the file data
    var _this = _possibleConstructorReturn(this, (DFUObject.__proto__ || Object.getPrototypeOf(DFUObject)).call(this));

    _this[transferSymbol] = transfer;
    // The offset into the file data
    _this[offsetSymbol] = offset;
    // How long this object is
    _this[lengthSymbol] = length;
    // TransferObjectType for this transfer object
    _this[typeSymbol] = transferType;
    // Initial state
    _this[stateSymbol] = _states2.default.NotStarted;
    //create a queue to enmsure the order of ble write objects
    _this[taskQueueSymbol] = (0, _queue2.default)(_task.Task.Worker, 1);
    //reports the progress
    _this[progressSymbol] = { completed: 0, size: length };
    return _this;
  }

  /** get/set pair **/

  _createClass(DFUObject, [{
    key: 'addTask',


    /** Schedules a BLE Action for execution and ensure the file transfer fail if an action cant be completed **/
    value: function addTask(dfuTask) {
      var _this2 = this;

      if (dfuTask instanceof _task.Task === false) {
        throw new Error('task is not of type Task');
      }
      this.taskQueue.push(dfuTask, function (error) {
        return _this2.onTaskComplete(error, dfuTask);
      });
    }
  }, {
    key: 'onTaskComplete',
    value: function onTaskComplete(error, dfuTask) {
      if (error) {
        this.taskQueue.kill();
        this.state = _states2.default.Failed;
      } else if (dfuTask.opcode == undefined) {
        var newCompleted = this.progress.completed + dfuTask.buffer.byteLength;
        this.progress = { completed: newCompleted, size: this.length };
      }
    }
    /**
      Internal convinence methods, a transfer object might have been partially
      transfered already, if so the offset passed in is none zero.
       Based on the offset and length into the Transfer objects file and the given
      offset in this range, create the number of chunks needed.
    **/

  }, {
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

    /** The first step in transferring this object, ask how much has already been transferred **/

  }, {
    key: 'begin',
    value: function begin() {
      this.state = _states2.default.Creating;
      this.addTask(_task.Task.verify(this.type, this.transfer.controlPoint));
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
      var min = this.offset;
      var max = min + this.length;
      return offset >= min && offset <= max;
    }

    /** Given an offset & checksum, take the appropirate next action **/

  }, {
    key: 'validate',
    value: function validate(offset, checksum) {
      /** The checksum reported back from a NRF51/52 is a crc of the Transfer object's file up till the offset */
      var fileCRCToOffset = _crc2.default.crc32(this.transfer.file.slice(0, offset));
      if (offset === this.offset + this.length && checksum === fileCRCToOffset) {
        /** Object has been transfered and should be moved into its right place on the device **/
        this.state = _states2.default.Storing;
        var operation = _task.Task.execute(this.transfer.controlPoint);
        this.addTask(operation);
      } else if (offset === this.offset || offset > this.offset + this.length || checksum !== fileCRCToOffset) {
        /** This object has not been transfered to the device or is faulty, recreate and transfer a new **/
        this.state = _states2.default.Creating;
        var _operation = _task.Task.create(this.type, this.length, this.transfer.controlPoint);
        this.addTask(_operation);
      } else {
        /** its the right object on the device but it has not been transfred fully **/
        this.state = _states2.default.Transfering;
        this.toPackets(offset);
        this.addTask(this.setPacketReturnNotification());
        this.sendChuncks();
      }
    }

    /** Slots all data chunks for transmission, the queue inside Transfer ensures the order **/

  }, {
    key: 'sendChuncks',
    value: function sendChuncks() {
      for (var index = 0; index < this.chunks.length; index++) {
        var buffer = this.chunks[index].buffer;
        this.addTask(_task.Task.writePackage(buffer, this.transfer.packetPoint));
      }
    }

    /** Request a notification when all packets for this transferObject has been received on the device **/

  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return _task.Task.setPacketReturnNotification(this.chunks.length, this.transfer.controlPoint);
    }

    /** handles events received on the Control Point Characteristic **/

  }, {
    key: 'eventHandler',
    value: function eventHandler(dataView) {
      /** Depending on which state this object is handle the relevent opcodes */
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
              console.warn('DFUObjectStates.Creating  Operation: ' + opCode + ' Result: ' + responseCode);
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
              console.warn('DFUObjectStates.Transfering  Operation: ' + opCode + ' Result: ' + responseCode);
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
              console.warn('DFUObjectStates.Storing  Operation: ' + opCode + ' Result: ' + responseCode);
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
      this.state = _states2.default.Transfering;
      /** start the transfer of the object  */
      this.toPackets(0);
      this.addTask(this.setPacketReturnNotification());
      this.sendChuncks();
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
      this.taskQueue.kill();
      this.state = _states2.default.Completed;
    }
  }, {
    key: 'length',
    get: function get() {
      return this[lengthSymbol];
    },
    set: function set(value) {
      this[lengthSymbol] = value;
      this[progressSymbol].size = value;
    }

    /** get/set pair **/

  }, {
    key: 'type',
    get: function get() {
      return this[typeSymbol];
    },
    set: function set(value) {
      this[typeSymbol] = value;
    }

    /** get/set pair **/

  }, {
    key: 'offset',
    get: function get() {
      return this[offsetSymbol];
    },
    set: function set(value) {
      this[offsetSymbol] = value;
    }

    /** get/set pair **/

  }, {
    key: 'transfer',
    get: function get() {
      return this[transferSymbol];
    },
    set: function set(value) {
      this[transferSymbol] = value;
    }

    /** get/set pair **/

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
    /** get/set pair **/

  }, {
    key: 'progress',
    get: function get() {
      return this[progressSymbol];
    },
    set: function set(value) {
      if (this[progressSymbol] !== value) {
        this[progressSymbol] = value;
        this.emit('progressChanged', { object: this, state: this[stateSymbol] });
      }
    }

    /** get/set pair **/

  }, {
    key: 'taskQueue',
    get: function get() {
      return this[taskQueueSymbol];
    }
  }]);

  return DFUObject;
}(_events2.default);

module.exports.DFUObject = DFUObject;
module.exports.DFUObjectStates = _states2.default;