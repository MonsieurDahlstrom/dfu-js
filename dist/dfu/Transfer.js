'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _TransferObject = require('./TransferObject');

var _Task = require('./Task');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** internal imports */
var TransferState = {
  Prepare: 0x00,
  Transfer: 0x01,
  Completed: 0x02,
  Failed: 0x03
};

/**
Nordic defines two different type of file transfers:
    init package is known as Command object
    firmware is known as Data object
**/
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

/** Library imports */
var TransferObjectType = {
  Command: 0x01,
  Data: 0x02
};

/**
Transfer class represents a binary file inside a firmware update zip.
A firmware update consists of a init package and data file. The StateMachine
parases the zip file and creates a transfer object for each entry in the zip

The statemachine uses a queue to slot the Transfers in order
**/

var Transfer = function () {
  (0, _createClass3.default)(Transfer, null, [{
    key: 'Worker',


    /** The queue inside StateMachine uses this function to process each Transfer **/
    value: function Worker(task, onCompleition) {
      if (task instanceof Transfer === false) {
        throw new Error('task is not of type Task');
      }
      if (!onCompleition) {
        throw new Error('onCompleition is not set');
      }
      task.begin();
      var intervalTimer = setInterval(function () {
        if (task.state === TransferState.Failed) {
          clearInterval(intervalTimer);
          task.end();
          onCompleition('Failed Transfer');
        } else if (task.state === TransferState.Completed) {
          clearInterval(intervalTimer);
          task.end();
          onCompleition();
        }
      }, 1000);
    }
  }]);

  function Transfer(fileData, controlPoint, packetPoint, objectType) {
    (0, _classCallCheck3.default)(this, Transfer);

    this.state = TransferState.Prepare;
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this.packetPoint = packetPoint;
    this.controlPoint = controlPoint;
    /** Data array representing the actual file to transfer **/
    this.file = fileData;
    /** The TransferObjectType this file represents */
    this.objectType = objectType;
    /** Create a queue to process the TransferObject's for this file in order */
    this.bleTasks = (0, _queue2.default)(_Task.Task.Worker, 1);
    this.bleTasks.error = function (error, task) {
      console.error(error);
      console.error(task);
    };
  }

  /** Schedules a BLE Action for execution and ensure the file transfer fail if an action cant be completed **/


  (0, _createClass3.default)(Transfer, [{
    key: 'addTask',
    value: function addTask(dfuTask) {
      var _this = this;

      if (dfuTask instanceof _Task.Task === false) {
        throw new Error('task is not of type Task');
      }
      this.bleTasks.push(dfuTask, function (error) {
        if (error) {
          _this.bleTasks.kill();
          _this.state = TransferState.Failed;
          console.error(error);
        }
      });
    }

    /** Begin the tranfer of a file by asking the NRF51/52 for meta data and verify if the file has been transfered already **/

  }, {
    key: 'begin',
    value: function begin() {
      this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this));
      var operation = _Task.Task.verify(this.objectType, this.controlPoint);
      this.addTask(operation);
    }

    /** Clean up event registrations when transfer is completed **/

  }, {
    key: 'end',
    value: function end() {
      this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent);
    }

    /**
    Given the type of device and object type, the maxium size that can be processed
    at a time varies. This method creates a set of TransferObject with this maxium size
    set.
      Secondly the device reports back how much of the file has been transfered and what the crc
    so far is. This method skips object that has already been completed
    **/

  }, {
    key: 'prepareTransferObjects',
    value: function prepareTransferObjects(maxiumSize, currentOffset, currentCRC) {
      this.maxObjectLength = maxiumSize;
      this.objects = [];
      this.currentObjectIndex = 0;
      this.generateObjects();
      /** Skip to object for the offset **/
      var object = this.objects.find(function (item) {
        return item.hasOffset(currentOffset);
      });
      if (object) {
        this.currentObjectIndex = this.objects.indexOf(object);
      }
      this.state = TransferState.Transfer;
      this.objects[this.currentObjectIndex].validate(currentOffset, currentCRC);
    }

    /**
    Internal convinence method.
    **/

  }, {
    key: 'generateObjects',
    value: function generateObjects() {
      var fileBegin = 0;
      var fileEnd = this.file.length;
      var index = fileBegin;
      while (index < fileEnd) {
        var objectBegin = index;
        var objectEnd = objectBegin + this.maxObjectLength < fileEnd ? this.maxObjectLength : fileEnd - index;
        var object = new _TransferObject.TransferObject(objectBegin, objectEnd, this, this.objectType, this.nextObject.bind(this));
        this.objects.push(object);
        index += this.maxObjectLength;
      }
    }

    /** handles events received on the Control Point Characteristic **/

  }, {
    key: 'onEvent',
    value: function onEvent(event) {
      /** guard to filter events that are not response codes  */
      var dataView = event.target.value;
      if (dataView && dataView.getInt8(0) !== _Task.TaskType.RESPONSE_CODE) {
        console.log('Transfer.onEvent() opcode was not a response code');
        return;
      }
      switch (this.state) {
        case TransferState.Prepare:
          {
            var opCode = dataView.getInt8(1);
            var responseCode = dataView.getInt8(2);
            if (opCode === _Task.TaskType.SELECT && responseCode === _Task.TaskResult.SUCCESS) {
              var maxiumSize = dataView.getUint32(3, true);
              var currentOffset = dataView.getUint32(7, true);
              var currentCRC = dataView.getUint32(11, true);
              this.prepareTransferObjects(maxiumSize, currentOffset, currentCRC);
            }
            break;
          }
        default:
          {
            this.objects[this.currentObjectIndex].eventHandler(dataView);
            break;
          }
      }
    }

    /** Checks if Transfer is complete or starts transferring the next TransferObject **/

  }, {
    key: 'nextObject',
    value: function nextObject() {
      if (this.currentObjectIndex < this.objects.length - 1) {
        this.bleTasks.kill();
        this.currentObjectIndex++;
        this.objects[this.currentObjectIndex].begin();
      } else {
        this.state = TransferState.Completed;
      }
    }
  }]);
  return Transfer;
}();

module.exports.Transfer = Transfer;
module.exports.TransferState = TransferState;
module.exports.TransferObjectType = TransferObjectType;