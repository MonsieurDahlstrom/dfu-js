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
}; /** Library imports */

var Transfer = function () {
  (0, _createClass3.default)(Transfer, null, [{
    key: 'Worker',
    value: function Worker(task, callback) {
      task.begin();
      var intervalTimer = setInterval(function () {
        if (task.state === DFUTransferState.Failed) {
          clearInterval(intervalTimer);
          task.end();
          callback('Failed Transfer');
        } else if (task.state === DFUTransferState.Completed) {
          clearInterval(intervalTimer);
          task.end();
          callback();
        }
      }, 1000);
    }
  }]);

  function Transfer(fileData, manager, packetPoint, controlPoint, objectType) {
    (0, _classCallCheck3.default)(this, Transfer);

    this.state = DFUTransferState.Prepare;
    this.packetPoint = packetPoint;
    this.controlPoint = controlPoint;
    this.stateMachine = manager;
    this.file = fileData;
    this.objectType = objectType;
    this.bleTasks = (0, _queue2.default)(DFUTask.Worker, 1);
  }

  (0, _createClass3.default)(Transfer, [{
    key: 'addTask',
    value: function addTask(dfuTask) {
      var _this = this;

      this.bleTasks.push(dfuTask, function (error) {
        if (error) {
          _this.bleTasks.kill();
          _this.state = DFUTransferState.Failed;
        }
      });
    }
  }, {
    key: 'begin',
    value: function begin() {
      this.controlPoint.addEventListener('characteristicvaluechanged', this.onEvent.bind(this));
      var operation = DFUTask.verify(this.objectType, this.controlPoint);
      this.addTask(operation);
    }
  }, {
    key: 'end',
    value: function end() {
      this.controlPoint.removeEventListener('characteristicvaluechanged', this.onEvent);
    }
  }, {
    key: 'prepareTransferObjects',
    value: function prepareTransferObjects(maxiumSize, currentoffset, currentCRC) {
      this.objectLength = maxiumSize;
      this.objects = [];
      this.currentObjectIndex = 0;
      var counter = 0;
      while (this.file.length > counter * this.objectLength) {
        var offset = counter * this.objectLength;
        var dataslice = this.file.slice(offset, offset + this.objectLength);
        this.objects[counter] = new DFUObject(dataslice, offset, this.objectType, this, this.nextObject.bind(this));
        counter++;
      }
      /** Skip to object for the offset **/
      var object = this.objects.find(function (item) {
        return item.offset === currentoffset;
      });
      if (object) {
        this.currentObjectIndex = this.objects.indexOf(object);
      }
      this.state = DFUTransferState.Transfer;
      this.objects[this.currentObjectIndex].begin();
    }
  }, {
    key: 'onEvent',
    value: function onEvent(event) {
      /** guard to filter events that are not response codes  */
      var dataView = event.target.value;
      if (dataView && dataView.getInt8(0) !== WWSecureDFUOperations.RESPONSE_CODE) {
        console.log('DFUTransfer.onEvent() opcode was not a response code');
        return;
      }
      /** */
      switch (this.state) {
        case DFUTransferState.Prepare:
          {
            var opCode = dataView.getInt8(1);
            var responseCode = dataView.getInt8(2);
            if (opCode === WWSecureDFUOperations.SELECT && responseCode === WWSecureDFUResults.SUCCESS) {
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
        this.state = DFUTransferState.Completed;
      }
    }
  }]);
  return Transfer;
}();

module.exports.Transfer = DFUTransfer;
module.exports.TransferState = DFUTransferState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZnUvVHJhbnNmZXIuanMiXSwibmFtZXMiOlsiVHJhbnNmZXJTdGF0ZSIsIlByZXBhcmUiLCJUcmFuc2ZlciIsIkNvbXBsZXRlZCIsIkZhaWxlZCIsInRhc2siLCJjYWxsYmFjayIsImJlZ2luIiwiaW50ZXJ2YWxUaW1lciIsInNldEludGVydmFsIiwic3RhdGUiLCJERlVUcmFuc2ZlclN0YXRlIiwiY2xlYXJJbnRlcnZhbCIsImVuZCIsImZpbGVEYXRhIiwibWFuYWdlciIsInBhY2tldFBvaW50IiwiY29udHJvbFBvaW50Iiwib2JqZWN0VHlwZSIsInN0YXRlTWFjaGluZSIsImZpbGUiLCJibGVUYXNrcyIsIkRGVVRhc2siLCJXb3JrZXIiLCJkZnVUYXNrIiwicHVzaCIsImVycm9yIiwia2lsbCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbkV2ZW50IiwiYmluZCIsIm9wZXJhdGlvbiIsInZlcmlmeSIsImFkZFRhc2siLCJyZW1vdmVFdmVudExpc3RlbmVyIiwibWF4aXVtU2l6ZSIsImN1cnJlbnRvZmZzZXQiLCJjdXJyZW50Q1JDIiwib2JqZWN0TGVuZ3RoIiwib2JqZWN0cyIsImN1cnJlbnRPYmplY3RJbmRleCIsImNvdW50ZXIiLCJsZW5ndGgiLCJvZmZzZXQiLCJkYXRhc2xpY2UiLCJzbGljZSIsIkRGVU9iamVjdCIsIm5leHRPYmplY3QiLCJvYmplY3QiLCJmaW5kIiwiaXRlbSIsImluZGV4T2YiLCJldmVudCIsImRhdGFWaWV3IiwidGFyZ2V0IiwidmFsdWUiLCJnZXRJbnQ4IiwiV1dTZWN1cmVERlVPcGVyYXRpb25zIiwiUkVTUE9OU0VfQ09ERSIsImNvbnNvbGUiLCJsb2ciLCJvcENvZGUiLCJyZXNwb25zZUNvZGUiLCJTRUxFQ1QiLCJXV1NlY3VyZURGVVJlc3VsdHMiLCJTVUNDRVNTIiwiZ2V0VWludDMyIiwiY3VycmVudE9mZnNldCIsInByZXBhcmVUcmFuc2Zlck9iamVjdHMiLCJldmVudEhhbmRsZXIiLCJtb2R1bGUiLCJl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QUNEO0FBQ0Q7QUFDRDtBQUNEO0FBQVM7QUFDUCxpQkFBS0UsT0FBTCxDQUFhLEtBQUtDLGtCQUFsQixFQUFzQzZCLFlBQXRDLENBQW1EaEIsUUFBbkQ7QUFDQTtBQUNEO0FBZkg7QUFpQkQ7OztpQ0FFYTtBQUNaLFVBQUksS0FBS2Isa0JBQUwsR0FBMEIsS0FBS0QsT0FBTCxDQUFhRyxNQUFiLEdBQXNCLENBQXBELEVBQXVEO0FBQ3JELGFBQUtyQixRQUFMLENBQWNNLElBQWQ7QUFDQSxhQUFLYSxrQkFBTDtBQUNBLGFBQUtELE9BQUwsQ0FBYSxLQUFLQyxrQkFBbEIsRUFBc0NqQyxLQUF0QztBQUNELE9BSkQsTUFJTztBQUNMLGFBQUtHLEtBQUwsR0FBYUMsaUJBQWlCUixTQUE5QjtBQUNEO0FBQ0Y7Ozs7O0FBR0htRSxPQUFPQyxPQUFQLENBQWVyRSxRQUFmLEdBQTBCc0UsV0FBMUI7QUFDQUYsT0FBT0MsT0FBUCxDQUFldkUsYUFBZixHQUErQlcsZ0JBQS9CIiwiZmlsZSI6IlRyYW5zZmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIExpYnJhcnkgaW1wb3J0cyAqL1xyXG5pbXBvcnQgcXVldWUgZnJvbSAnYXN5bmMvcXVldWUnXHJcbi8qKiBpbnRlcm5hbCBpbXBvcnRzICovXHJcbmltcG9ydCB7VHJhbnNmZXJPYmplY3QsVHJhbnNmZXJPYmplY3RTdGF0ZX0gZnJvbSAnLi9UcmFuc2Zlck9iamVjdCdcclxuaW1wb3J0IHtUYXNrLCBUYXNrVHlwZSwgVGFza1Jlc3VsdH0gZnJvbSAnLi9UYXNrJ1xyXG5cclxuY29uc3QgVHJhbnNmZXJTdGF0ZSA9IHtcclxuICBQcmVwYXJlOiAweDAwLFxyXG4gIFRyYW5zZmVyOiAweDAxLFxyXG4gIENvbXBsZXRlZDogMHgwMixcclxuICBGYWlsZWQ6IDB4MDNcclxufVxyXG5cclxuY2xhc3MgVHJhbnNmZXIge1xyXG5cclxuICBzdGF0aWMgV29ya2VyICh0YXNrLCBjYWxsYmFjaykge1xyXG4gICAgdGFzay5iZWdpbigpXHJcbiAgICBjb25zdCBpbnRlcnZhbFRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICBpZiAodGFzay5zdGF0ZSA9PT0gREZVVHJhbnNmZXJTdGF0ZS5GYWlsZWQpIHtcclxuICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsVGltZXIpXHJcbiAgICAgICAgdGFzay5lbmQoKVxyXG4gICAgICAgIGNhbGxiYWNrKCdGYWlsZWQgVHJhbnNmZXInKVxyXG4gICAgICB9IGVsc2UgaWYgKHRhc2suc3RhdGUgPT09IERGVVRyYW5zZmVyU3RhdGUuQ29tcGxldGVkKSB7XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbFRpbWVyKVxyXG4gICAgICAgIHRhc2suZW5kKClcclxuICAgICAgICBjYWxsYmFjaygpXHJcbiAgICAgIH1cclxuICAgIH0sIDEwMDApXHJcbiAgfVxyXG5cclxuICBjb25zdHJ1Y3RvciAoZmlsZURhdGEsIG1hbmFnZXIsIHBhY2tldFBvaW50LCBjb250cm9sUG9pbnQsIG9iamVjdFR5cGUpIHtcclxuICAgIHRoaXMuc3RhdGUgPSBERlVUcmFuc2ZlclN0YXRlLlByZXBhcmVcclxuICAgIHRoaXMucGFja2V0UG9pbnQgPSBwYWNrZXRQb2ludFxyXG4gICAgdGhpcy5jb250cm9sUG9pbnQgPSBjb250cm9sUG9pbnRcclxuICAgIHRoaXMuc3RhdGVNYWNoaW5lID0gbWFuYWdlclxyXG4gICAgdGhpcy5maWxlID0gZmlsZURhdGFcclxuICAgIHRoaXMub2JqZWN0VHlwZSA9IG9iamVjdFR5cGVcclxuICAgIHRoaXMuYmxlVGFza3MgPSBxdWV1ZShERlVUYXNrLldvcmtlciwgMSlcclxuICB9XHJcblxyXG4gIGFkZFRhc2sgKGRmdVRhc2spIHtcclxuICAgIHRoaXMuYmxlVGFza3MucHVzaChkZnVUYXNrLCAoZXJyb3IpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgdGhpcy5ibGVUYXNrcy5raWxsKClcclxuICAgICAgICB0aGlzLnN0YXRlID0gREZVVHJhbnNmZXJTdGF0ZS5GYWlsZWRcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGJlZ2luICgpIHtcclxuICAgIHRoaXMuY29udHJvbFBvaW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYXJhY3RlcmlzdGljdmFsdWVjaGFuZ2VkJywgdGhpcy5vbkV2ZW50LmJpbmQodGhpcykpXHJcbiAgICBsZXQgb3BlcmF0aW9uID0gREZVVGFzay52ZXJpZnkodGhpcy5vYmplY3RUeXBlLCB0aGlzLmNvbnRyb2xQb2ludClcclxuICAgIHRoaXMuYWRkVGFzayhvcGVyYXRpb24pXHJcbiAgfVxyXG5cclxuICBlbmQgKCkge1xyXG4gICAgdGhpcy5jb250cm9sUG9pbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2hhcmFjdGVyaXN0aWN2YWx1ZWNoYW5nZWQnLCB0aGlzLm9uRXZlbnQpXHJcbiAgfVxyXG5cclxuICBwcmVwYXJlVHJhbnNmZXJPYmplY3RzIChtYXhpdW1TaXplLCBjdXJyZW50b2Zmc2V0LCBjdXJyZW50Q1JDKSB7XHJcbiAgICB0aGlzLm9iamVjdExlbmd0aCA9IG1heGl1bVNpemVcclxuICAgIHRoaXMub2JqZWN0cyA9IFtdXHJcbiAgICB0aGlzLmN1cnJlbnRPYmplY3RJbmRleCA9IDBcclxuICAgIGxldCBjb3VudGVyID0gMFxyXG4gICAgd2hpbGUgKHRoaXMuZmlsZS5sZW5ndGggPiBjb3VudGVyICogdGhpcy5vYmplY3RMZW5ndGgpIHtcclxuICAgICAgbGV0IG9mZnNldCA9IGNvdW50ZXIgKiB0aGlzLm9iamVjdExlbmd0aFxyXG4gICAgICBsZXQgZGF0YXNsaWNlID0gdGhpcy5maWxlLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgdGhpcy5vYmplY3RMZW5ndGgpXHJcbiAgICAgIHRoaXMub2JqZWN0c1tjb3VudGVyXSA9IG5ldyBERlVPYmplY3QoZGF0YXNsaWNlLCBvZmZzZXQsIHRoaXMub2JqZWN0VHlwZSwgdGhpcywgdGhpcy5uZXh0T2JqZWN0LmJpbmQodGhpcykpXHJcbiAgICAgIGNvdW50ZXIrK1xyXG4gICAgfVxyXG4gICAgLyoqIFNraXAgdG8gb2JqZWN0IGZvciB0aGUgb2Zmc2V0ICoqL1xyXG4gICAgbGV0IG9iamVjdCA9IHRoaXMub2JqZWN0cy5maW5kKChpdGVtKSA9PiBpdGVtLm9mZnNldCA9PT0gY3VycmVudG9mZnNldClcclxuICAgIGlmIChvYmplY3QpIHtcclxuICAgICAgdGhpcy5jdXJyZW50T2JqZWN0SW5kZXggPSB0aGlzLm9iamVjdHMuaW5kZXhPZihvYmplY3QpXHJcbiAgICB9XHJcbiAgICB0aGlzLnN0YXRlID0gREZVVHJhbnNmZXJTdGF0ZS5UcmFuc2ZlclxyXG4gICAgdGhpcy5vYmplY3RzW3RoaXMuY3VycmVudE9iamVjdEluZGV4XS5iZWdpbigpXHJcbiAgfVxyXG5cclxuICBvbkV2ZW50IChldmVudCkge1xyXG4gICAgLyoqIGd1YXJkIHRvIGZpbHRlciBldmVudHMgdGhhdCBhcmUgbm90IHJlc3BvbnNlIGNvZGVzICAqL1xyXG4gICAgbGV0IGRhdGFWaWV3ID0gZXZlbnQudGFyZ2V0LnZhbHVlXHJcbiAgICBpZiAoZGF0YVZpZXcgJiYgZGF0YVZpZXcuZ2V0SW50OCgwKSAhPT0gV1dTZWN1cmVERlVPcGVyYXRpb25zLlJFU1BPTlNFX0NPREUpIHtcclxuICAgICAgY29uc29sZS5sb2coJ0RGVVRyYW5zZmVyLm9uRXZlbnQoKSBvcGNvZGUgd2FzIG5vdCBhIHJlc3BvbnNlIGNvZGUnKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIC8qKiAqL1xyXG4gICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XHJcbiAgICAgIGNhc2UgREZVVHJhbnNmZXJTdGF0ZS5QcmVwYXJlOiB7XHJcbiAgICAgICAgbGV0IG9wQ29kZSA9IGRhdGFWaWV3LmdldEludDgoMSlcclxuICAgICAgICBsZXQgcmVzcG9uc2VDb2RlID0gZGF0YVZpZXcuZ2V0SW50OCgyKVxyXG4gICAgICAgIGlmIChvcENvZGUgPT09IFdXU2VjdXJlREZVT3BlcmF0aW9ucy5TRUxFQ1QgJiYgcmVzcG9uc2VDb2RlID09PSBXV1NlY3VyZURGVVJlc3VsdHMuU1VDQ0VTUykge1xyXG4gICAgICAgICAgbGV0IG1heGl1bVNpemUgPSBkYXRhVmlldy5nZXRVaW50MzIoMywgdHJ1ZSlcclxuICAgICAgICAgIGxldCBjdXJyZW50T2Zmc2V0ID0gZGF0YVZpZXcuZ2V0VWludDMyKDcsIHRydWUpXHJcbiAgICAgICAgICBsZXQgY3VycmVudENSQyA9IGRhdGFWaWV3LmdldFVpbnQzMigxMSwgdHJ1ZSlcclxuICAgICAgICAgIHRoaXMucHJlcGFyZVRyYW5zZmVyT2JqZWN0cyhtYXhpdW1TaXplLCBjdXJyZW50T2Zmc2V0LCBjdXJyZW50Q1JDKVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICAgIGRlZmF1bHQ6IHtcclxuICAgICAgICB0aGlzLm9iamVjdHNbdGhpcy5jdXJyZW50T2JqZWN0SW5kZXhdLmV2ZW50SGFuZGxlcihkYXRhVmlldylcclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBuZXh0T2JqZWN0ICgpIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRPYmplY3RJbmRleCA8IHRoaXMub2JqZWN0cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgIHRoaXMuYmxlVGFza3Mua2lsbCgpXHJcbiAgICAgIHRoaXMuY3VycmVudE9iamVjdEluZGV4KytcclxuICAgICAgdGhpcy5vYmplY3RzW3RoaXMuY3VycmVudE9iamVjdEluZGV4XS5iZWdpbigpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN0YXRlID0gREZVVHJhbnNmZXJTdGF0ZS5Db21wbGV0ZWRcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzLlRyYW5zZmVyID0gREZVVHJhbnNmZXJcclxubW9kdWxlLmV4cG9ydHMuVHJhbnNmZXJTdGF0ZSA9IERGVVRyYW5zZmVyU3RhdGVcclxuIl19