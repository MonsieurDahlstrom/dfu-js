"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

var _task = require('../task');

var _dfuObject = require('../dfu-object');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fileSymbol = (0, _symbol2.default)();
var stateSymbol = (0, _symbol2.default)();
var packetPointSymbol = (0, _symbol2.default)();
var controlPointSymbol = (0, _symbol2.default)();
var tasksSymbol = (0, _symbol2.default)();
var objectsSymbol = (0, _symbol2.default)();
var maximumObjectLengthSymbol = (0, _symbol2.default)();
var typeSymbol = (0, _symbol2.default)();
var progressSymbol = (0, _symbol2.default)();

var Transfer = function () {
  (0, _createClass3.default)(Transfer, [{
    key: 'file',
    get: function get() {
      return this[fileSymbol];
    },
    set: function set(value) {
      this[fileSymbol] = value;
    }
  }, {
    key: 'state',
    get: function get() {
      return this[stateSymbol];
    },
    set: function set(value) {
      this[stateSymbol] = value;
    }
  }, {
    key: 'packetPoint',
    get: function get() {
      return this[packetPointSymbol];
    },
    set: function set(value) {
      this[packetPointSymbol] = value;
    }
  }, {
    key: 'controlPoint',
    get: function get() {
      return this[controlPointSymbol];
    },
    set: function set(value) {
      this[controlPointSymbol] = value;
    }
  }, {
    key: 'tasks',
    get: function get() {
      return this[tasksSymbol];
    },
    set: function set(value) {
      this[tasksSymbol] = value;
    }
  }, {
    key: 'objects',
    get: function get() {
      return this[objectsSymbol];
    },
    set: function set(value) {
      this[objectsSymbol] = value;
    }
  }, {
    key: 'maximumObjectLength',
    get: function get() {
      return this[maximumObjectLengthSymbol];
    },
    set: function set(value) {
      this[maximumObjectLengthSymbol] = value;
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
    key: 'progress',
    get: function get() {
      return this[progressSymbol];
    },
    set: function set(value) {
      this[progressSymbol] = value;
    }
  }]);

  function Transfer(fileData, controlPoint, packetPoint, objectType) {
    (0, _classCallCheck3.default)(this, Transfer);

    this[stateSymbol] = _states2.default.Prepare;

    this[packetPointSymbol] = packetPoint;
    this[controlPointSymbol] = controlPoint;

    this[fileSymbol] = fileData;

    this[typeSymbol] = objectType;

    this[tasksSymbol] = (0, _queue2.default)(_task.Task.Worker, 1);
    this[tasksSymbol].error = function (error, task) {
      console.error(error);
      console.error(task);
    };

    this[objectsSymbol] = [];
  }

  (0, _createClass3.default)(Transfer, [{
    key: 'calculateProgress',
    value: function calculateProgress() {
      switch (this.state) {
        case _states2.default.Prepare:
          {
            this.progress = 0.0;
            break;
          }
        case _states2.default.Transfer:
          {
            var difference = (this.currentObjectIndex + 1) / this.objects.length;
            if (difference < 1.0) {
              this.progress = difference - this.objects[this.currentObjectIndex].progress();
            } else {
              this.progress = difference - 0.02;
            }
            break;
          }
        default:
          {
            this.progress = 1.0;
            break;
          }
      }
    }
  }, {
    key: 'addTask',
    value: function addTask(dfuTask) {
      var _this = this;

      if (dfuTask instanceof _task.Task === false) {
        throw new Error('task is not of type Task');
      }
      this.tasks.push(dfuTask, function (error) {
        if (error) {
          _this.tasks.kill();
          _this.state = _states2.default.Failed;
          console.error(error);
        }
      });
    }
  }, {
    key: 'begin',
    value: function begin() {
      this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this));
      var operation = _task.Task.verify(this.objectType, this.controlPoint);
      this.addTask(operation);
    }
  }, {
    key: 'end',
    value: function end() {
      this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent);
    }
  }, {
    key: 'prepareDFUObjects',
    value: function prepareDFUObjects(maxiumSize, currentOffset, currentCRC) {
      this.maximumObjectLength = maxiumSize;
      this.currentObjectIndex = 0;
      this.generateObjects();

      var object = this.objects.find(function (item) {
        return item.hasOffset(currentOffset);
      });
      if (object) {
        this.currentObjectIndex = this.objects.indexOf(object);
      }
      this.state = _states2.default.Transfer;
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
        var objectEnd = objectBegin + this.maximumObjectLength < fileEnd ? this.maximumObjectLength : fileEnd - index;
        var object = new _dfuObject.DFUObject(objectBegin, objectEnd, this, this.objectType, this.nextObject.bind(this));
        this.objects.push(object);
        index += this.maximumObjectLength;
      }
    }
  }, {
    key: 'onEvent',
    value: function onEvent(event) {
      var dataView = event.target.value;
      if (dataView && dataView.getInt8(0) !== _task.TaskTypes.RESPONSE_CODE) {
        console.log('Transfer.onEvent() opcode was not a response code');
        return;
      }
      switch (this.state) {
        case _states2.default.Prepare:
          {
            var opCode = dataView.getInt8(1);
            var responseCode = dataView.getInt8(2);
            if (opCode === _task.TaskTypes.SELECT && responseCode === _task.TaskResults.SUCCESS) {
              var maxiumSize = dataView.getUint32(3, true);
              var currentOffset = dataView.getUint32(7, true);
              var currentCRC = dataView.getUint32(11, true);
              this.prepareDFUObjects(maxiumSize, currentOffset, currentCRC);
            }
            break;
          }
        default:
          {
            if (this.objects !== undefined && this.objects[this.currentObjectIndex] !== undefined) {
              this.objects[this.currentObjectIndex].eventHandler(dataView);
            } else {
              console.error('Transfer.onEvent called with no objects or no current object');
            }
            break;
          }
      }
      this.calculateProgress();
    }
  }, {
    key: 'nextObject',
    value: function nextObject() {
      if (this.currentObjectIndex < this.objects.length - 1) {
        this.tasks.kill();
        this.currentObjectIndex++;
        this.objects[this.currentObjectIndex].begin();
      } else {
        this.state = _states2.default.Completed;
      }
    }
  }]);
  return Transfer;
}();

exports.default = Transfer;
//# sourceMappingURL=transfer.js.map