'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

var _task = require('../task');

var _dfuObject = require('../dfu-object');

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

/** Library imports */

/** internal imports */


var fileSymbol = Symbol();
var stateSymbol = Symbol();
var packetPointSymbol = Symbol();
var controlPointSymbol = Symbol();
var objectsSymbol = Symbol();
var maximumObjectLengthSymbol = Symbol();
var typeSymbol = Symbol();
var progressSymbol = Symbol();

var Transfer = function (_EventEmitter) {
  _inherits(Transfer, _EventEmitter);

  _createClass(Transfer, [{
    key: 'file',

    /** Get/Set pair **/
    get: function get() {
      return this[fileSymbol];
    },
    set: function set(value) {
      this[fileSymbol] = value;
    }

    /** Get/Set pair **/

  }, {
    key: 'state',
    get: function get() {
      return this[stateSymbol];
    },
    set: function set(value) {
      if (this[stateSymbol] !== value) {
        this[stateSymbol] = value;
        this.emit('stateChanged', { transfer: this, state: this[stateSymbol] });
      }
    }

    /** Get/Set pair **/

  }, {
    key: 'packetPoint',
    get: function get() {
      return this[packetPointSymbol];
    },
    set: function set(value) {
      this[packetPointSymbol] = value;
    }

    /** Get/Set pair **/

  }, {
    key: 'controlPoint',
    get: function get() {
      return this[controlPointSymbol];
    },
    set: function set(value) {
      this[controlPointSymbol] = value;
    }

    /** Get/Set pair **/

  }, {
    key: 'objects',
    get: function get() {
      return this[objectsSymbol];
    },
    set: function set(value) {
      this[objectsSymbol] = value;
    }

    /** Get/Set pair **/

  }, {
    key: 'maximumObjectLength',
    get: function get() {
      return this[maximumObjectLengthSymbol];
    },
    set: function set(value) {
      this[maximumObjectLengthSymbol] = value;
    }

    /** Get/Set pair **/

  }, {
    key: 'type',
    get: function get() {
      return this[typeSymbol];
    },
    set: function set(value) {
      this[typeSymbol] = value;
    }

    /** Get/Set pair **/

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
    _classCallCheck(this, Transfer);

    var _this = _possibleConstructorReturn(this, (Transfer.__proto__ || Object.getPrototypeOf(Transfer)).call(this));

    _this[stateSymbol] = _states2.default.Prepare;
    /** The WebBluetooth Characteristics needed to transfer a file **/
    _this[packetPointSymbol] = packetPoint;
    _this[controlPointSymbol] = controlPoint;
    /** Data array representing the actual file to transfer **/
    _this[fileSymbol] = fileData;
    /** The DFUObjectType this file represents */
    _this[typeSymbol] = objectType;
    /** empty list of DFUObject */
    _this[objectsSymbol] = [];
    _this[progressSymbol] = 0.0;
    return _this;
  }

  _createClass(Transfer, [{
    key: 'checkProgress',
    value: function checkProgress() {
      switch (this.state) {
        case _states2.default.Completed:
          this.progress = 1.0;
          break;
        case _states2.default.Failed:
          this.progress = 1.0;
          break;
        case _states2.default.Transfer:
          var percentagePerObject = 1.0 / this.objects.length;
          this.progress = this.objects.reduce(function (sum, dfuObject) {
            switch (dfuObject.state) {
              case _dfuObject.DFUObjectStates.Completed:
                return sum + percentagePerObject;
              case _dfuObject.DFUObjectStates.Failed:
                return sum + percentagePerObject;
              case _dfuObject.DFUObjectStates.Storing:
                return sum + percentagePerObject;
              case _dfuObject.DFUObjectStates.Transfering:
                var percentageCompleted = dfuObject.progress.completed / dfuObject.progress.size;
                return sum + percentagePerObject * percentageCompleted;
              default:
                return sum;
            }
          }, 0.0);
          break;
        default:
          this.progress = 0.0;
      }
    }

    /** Begin the tranfer of a file by asking the NRF51/52 for meta data and verify if the file has been transfered already **/

  }, {
    key: 'begin',
    value: function begin() {
      this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this));
      var operation = _task.Task.verify(this.type, this.controlPoint);
      _task.Task.Worker(operation, function () {});
    }

    /** Clean up event registrations when transfer is completed **/

  }, {
    key: 'end',
    value: function end() {
      this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent);
    }

    /**
    Given the type of device and object type, the maxium size that can be processed
    at a time varies. This method creates a set of DFUObject with this maxium size
    set.
     Secondly the device reports back how much of the file has been transfered and what the crc
    so far is. This method skips object that has already been completed
    **/

  }, {
    key: 'prepareDFUObjects',
    value: function prepareDFUObjects(maxiumSize, currentOffset, currentCRC) {
      this.maximumObjectLength = maxiumSize;
      this.currentObjectIndex = 0;
      this.generateObjects();
      /** Skip to object for the offset **/
      var object = this.objects.find(function (item) {
        return item.hasOffset(currentOffset);
      });
      if (object) {
        this.currentObjectIndex = this.objects.indexOf(object);
      }
      this.state = _states2.default.Transfer;
      this.objects[this.currentObjectIndex].validate(currentOffset, currentCRC);
    }

    /**
    Internal convinence method.
    **/

  }, {
    key: 'generateObjects',
    value: function generateObjects() {
      var _this2 = this;

      var fileBegin = 0;
      var fileEnd = this.file.length;
      var index = fileBegin;
      while (index < fileEnd) {
        var objectBegin = index;
        var objectEnd = objectBegin + this.maximumObjectLength < fileEnd ? this.maximumObjectLength : fileEnd - index;
        var object = new _dfuObject.DFUObject(objectBegin, objectEnd, this, this.type);
        object.on('stateChanged', function (event) {
          if (event.state === _dfuObject.DFUObjectStates.Failed) {
            _this2.state = _states2.default.Failed;
          } else if (event.state === _dfuObject.DFUObjectStates.Completed) {
            _this2.nextObject();
          }
        });
        object.on('progressChanged', function (event) {
          return _this2.checkProgress();
        });
        this.objects.push(object);
        index += this.maximumObjectLength;
      }
    }

    /** handles events received on the Control Point Characteristic **/

  }, {
    key: 'onEvent',
    value: function onEvent(event) {
      /** guard to filter events that are not response codes  */
      var dataView = event.target.value;
      if (dataView && dataView.getInt8(0) !== _task.TaskTypes.RESPONSE_CODE) {
        console.warn('Transfer.onEvent() opcode was not a response code');
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
              if (this.objects[this.currentObjectIndex].state === _dfuObject.DFUObjectStates.Failed) {
                this.state == _states2.default.Failed;
              }
            } else {
              this.state = _states2.default.Failed;
            }
            break;
          }
      }
    }

    /** Checks if Transfer is complete or starts transferring the next DFUObject **/

  }, {
    key: 'nextObject',
    value: function nextObject() {
      if (this.currentObjectIndex < this.objects.length - 1) {
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