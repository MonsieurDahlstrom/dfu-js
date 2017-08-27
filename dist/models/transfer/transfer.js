"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _symbol = require('babel-runtime/core-js/symbol');

var _symbol2 = _interopRequireDefault(_symbol);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

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

var Transfer = function (_EventEmitter) {
  (0, _inherits3.default)(Transfer, _EventEmitter);
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
      if (value !== this[progressSymbol]) {
        this[progressSymbol] = value;
        this.emit('progressChanged', { transfer: this, progress: value });
      }
    }
  }]);

  function Transfer(fileData, controlPoint, packetPoint, objectType) {
    (0, _classCallCheck3.default)(this, Transfer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Transfer.__proto__ || (0, _getPrototypeOf2.default)(Transfer)).call(this));

    _this[stateSymbol] = _states2.default.Prepare;

    _this[packetPointSymbol] = packetPoint;
    _this[controlPointSymbol] = controlPoint;

    _this[fileSymbol] = fileData;

    _this[typeSymbol] = objectType;

    _this[tasksSymbol] = (0, _queue2.default)(_task.Task.Worker, 1);
    _this[tasksSymbol].error = function (error, task) {
      console.error(error);
      console.error(task);
    };

    _this[objectsSymbol] = [];
    _this[progressSymbol] = 0;
    return _this;
  }

  (0, _createClass3.default)(Transfer, [{
    key: 'checkProgress',
    value: function checkProgress() {
      if (this.objects.length > 0) {
        var completedObjects = this.objects.reduce(function (sum, value) {
          if (value.state === _dfuObject.DFUObjectStates.Completed || value.state === _dfuObject.DFUObjectStates.Failed) {
            return sum += 1;
          } else {
            return sum;
          }
        }, 0);
        this.progress = completedObjects / this.objects.length;
      }
    }
  }, {
    key: 'addTask',
    value: function addTask(dfuTask) {
      var _this2 = this;

      if (dfuTask instanceof _task.Task === false) {
        throw new Error('task is not of type Task');
      }
      this.tasks.push(dfuTask, function (error) {
        if (error) {
          _this2.tasks.kill();
          _this2.state = _states2.default.Failed;
          console.error(error);
        }
      });
    }
  }, {
    key: 'begin',
    value: function begin() {
      this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this));
      var operation = _task.Task.verify(this.type, this.controlPoint);
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
        var object = new _dfuObject.DFUObject(objectBegin, objectEnd, this, this.type, this.nextObject.bind(this));
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
      this.checkProgress();
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
}(_events2.default);

exports.default = Transfer;
//# sourceMappingURL=transfer.js.map