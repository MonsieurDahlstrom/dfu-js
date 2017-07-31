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

var TransferState = {
  Prepare: 0x00,
  Transfer: 0x01,
  Completed: 0x02,
  Failed: 0x03
};

var TransferObjectType = {
  Command: 0x01,
  Data: 0x02
};

var Transfer = function () {
  (0, _createClass3.default)(Transfer, null, [{
    key: 'Worker',
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

    this.packetPoint = packetPoint;
    this.controlPoint = controlPoint;

    this.file = fileData;

    this.objectType = objectType;

    this.bleTasks = (0, _queue2.default)(_Task.Task.Worker, 1);
    this.bleTasks.error = function (error, task) {
      console.error(error);
      console.error(task);
    };
  }

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
  }, {
    key: 'begin',
    value: function begin() {
      this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this));
      var operation = _Task.Task.verify(this.objectType, this.controlPoint);
      this.addTask(operation);
    }
  }, {
    key: 'end',
    value: function end() {
      this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent);
    }
  }, {
    key: 'prepareTransferObjects',
    value: function prepareTransferObjects(maxiumSize, currentOffset, currentCRC) {
      this.maxObjectLength = maxiumSize;
      this.objects = [];
      this.currentObjectIndex = 0;
      this.generateObjects();

      var object = this.objects.find(function (item) {
        return item.hasOffset(currentOffset);
      });
      if (object) {
        this.currentObjectIndex = this.objects.indexOf(object);
      }
      this.state = TransferState.Transfer;
      this.objects[this.currentObjectIndex].validate(currentOffset, currentCRC);
    }
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
  }, {
    key: 'onEvent',
    value: function onEvent(event) {
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