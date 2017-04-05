'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TaskType = {
  CREATE: 0x01,
  SET_PRN: 0x02,
  CALCULATE_CHECKSUM: 0x03,
  EXECUTE: 0x04,
  SELECT: 0x06,
  RESPONSE_CODE: 0x60
};

var TaskResult = {
  INVALID_CODE: 0x00,
  SUCCESS: 0x01,
  OPCODE_NOT_SUPPORTED: 0x02,
  INVALID_PARAMETER: 0x03,
  INSUFFICIENT_RESOURCES: 0x04,
  INVALID_OBJECT: 0x05,
  UNSUPPORTED_TYPE: 0x07,
  OPERATION_NOT_PERMITTED: 0x08,
  OPERATION_FAILED: 0x0A
};

var Task = function () {
  function Task(characteristicToWriteTo, bytesToWrite, commandToExecute) {
    (0, _classCallCheck3.default)(this, Task);

    this.opcode = commandToExecute;
    this.buffer = bytesToWrite;
    this.characteristic = characteristicToWriteTo;
  }

  (0, _createClass3.default)(Task, null, [{
    key: 'Worker',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(task, callback) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return task.characteristic.writeValue(task.buffer);

              case 3:
                setTimeout(function () {
                  callback();
                }, 100);
                _context.next = 10;
                break;

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](0);

                console.log(_context.t0);
                callback('BLE Transfer Failed');

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 6]]);
      }));

      function Worker(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return Worker;
    }()
  }, {
    key: 'verify',
    value: function verify(objectType, characteristic) {
      var dataView = new DataView(new ArrayBuffer(2));
      dataView.setUint8(0, TaskType.SELECT);
      dataView.setUint8(1, objectType);
      return new DFUTask(characteristic, dataView.buffer, TaskType.SELECT);
    }
  }, {
    key: 'create',
    value: function create(objectType, length, characteristic) {
      var dataView = new DataView(new ArrayBuffer(6));
      dataView.setUint8(0, TaskType.CREATE);
      dataView.setUint8(1, objectType);
      /** Data length set to little endian converstion */
      dataView.setUint32(2, length, true);
      return new DFUTask(characteristic, dataView.buffer, TaskType.CREATE);
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification(packageCount, characteristic) {
      var dataView = new DataView(new ArrayBuffer(3));
      dataView.setUint8(0, TaskType.SET_PRN);
      /** Set the package received notification to the number of expected packages */
      dataView.setUint16(1, packageCount, true);
      return new DFUTask(characteristic, dataView.buffer, TaskType.SET_PRN);
    }
  }, {
    key: 'writePackage',
    value: function writePackage(buffer, characteristic) {
      return new DFUTask(characteristic, buffer);
    }
  }, {
    key: 'checksum',
    value: function checksum(characteristic) {
      var dataView = new DataView(new ArrayBuffer(1));
      dataView.setUint8(0, TaskType.CALCULATE_CHECKSUM);
      return new DFUTask(characteristic, dataView.buffer, TaskType.CALCULATE_CHECKSUM);
    }
  }, {
    key: 'execute',
    value: function execute(characteristic) {
      var dataView = new DataView(new ArrayBuffer(1));
      dataView.setUint8(0, TaskType.EXECUTE);
      return new DFUTask(characteristic, dataView.buffer, TaskType.EXECUTE);
    }
  }]);
  return Task;
}();

module.exports.Task = Task;
module.exports.TaskType = TaskType;
module.exports.TaskResult = TaskResult;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZnUvVGFzay5qcyJdLCJuYW1lcyI6WyJUYXNrVHlwZSIsIkNSRUFURSIsIlNFVF9QUk4iLCJDQUxDVUxBVEVfQ0hFQ0tTVU0iLCJFWEVDVVRFIiwiU0VMRUNUIiwiUkVTUE9OU0VfQ09ERSIsIlRhc2tSZXN1bHQiLCJJTlZBTElEX0NPREUiLCJTVUNDRVNTIiwiT1BDT0RFX05PVF9TVVBQT1JURUQiLCJJTlZBTElEX1BBUkFNRVRFUiIsIklOU1VGRklDSUVOVF9SRVNPVVJDRVMiLCJJTlZBTElEX09CSkVDVCIsIlVOU1VQUE9SVEVEX1RZUEUiLCJPUEVSQVRJT05fTk9UX1BFUk1JVFRFRCIsIk9QRVJBVElPTl9GQUlMRUQiLCJUYXNrIiwiY2hhcmFjdGVyaXN0aWNUb1dyaXRlVG8iLCJieXRlc1RvV3JpdGUiLCJjb21tYW5kVG9FeGVjdXRlIiwib3Bjb2RlIiwiYnVmZmVyIiwiY2hhcmFjdGVyaXN0aWMiLCJ0YXNrIiwiY2FsbGJhY2siLCJ3cml0ZVZhbHVlIiwic2V0VGltZW91dCIsImNvbnNvbGUiLCJsb2ciLCJvYmplY3RUeXBlIiwiZGF0YVZpZXciLCJEYXRhVmlldyIsIkFycmF5QnVmZmVyIiwic2V0VWludDgiLCJERlVUYXNrIiwibGVuZ3RoIiwic2V0VWludDMyIiwicGFja2FnZUNvdW50Iiwic2V0VWludDE2IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFNQSxXQUFXO0FBQ2ZDLFVBQVEsSUFETztBQUVmQyxXQUFTLElBRk07QUFHZkMsc0JBQW9CLElBSEw7QUFJZkMsV0FBUyxJQUpNO0FBS2ZDLFVBQVEsSUFMTztBQU1mQyxpQkFBZTtBQU5BLENBQWpCOztBQVNBLElBQU1DLGFBQWE7QUFDakJDLGdCQUFjLElBREc7QUFFakJDLFdBQVMsSUFGUTtBQUdqQkMsd0JBQXNCLElBSEw7QUFJakJDLHFCQUFtQixJQUpGO0FBS2pCQywwQkFBd0IsSUFMUDtBQU1qQkMsa0JBQWdCLElBTkM7QUFPakJDLG9CQUFrQixJQVBEO0FBUWpCQywyQkFBeUIsSUFSUjtBQVNqQkMsb0JBQWtCO0FBVEQsQ0FBbkI7O0lBWU1DLEk7QUFFSixnQkFBYUMsdUJBQWIsRUFBc0NDLFlBQXRDLEVBQW9EQyxnQkFBcEQsRUFBc0U7QUFBQTs7QUFDcEUsU0FBS0MsTUFBTCxHQUFjRCxnQkFBZDtBQUNBLFNBQUtFLE1BQUwsR0FBY0gsWUFBZDtBQUNBLFNBQUtJLGNBQUwsR0FBc0JMLHVCQUF0QjtBQUNEOzs7Ozs2RkFFb0JNLEksRUFBTUMsUTs7Ozs7Ozt1QkFFakJELEtBQUtELGNBQUwsQ0FBb0JHLFVBQXBCLENBQStCRixLQUFLRixNQUFwQyxDOzs7QUFDTkssMkJBQVcsWUFBWTtBQUNyQkY7QUFDRCxpQkFGRCxFQUVHLEdBRkg7Ozs7Ozs7O0FBSUFHLHdCQUFRQyxHQUFSO0FBQ0FKLHlCQUFTLHFCQUFUOzs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBSVdLLFUsRUFBWVAsYyxFQUFnQjtBQUN6QyxVQUFJUSxXQUFXLElBQUlDLFFBQUosQ0FBYSxJQUFJQyxXQUFKLENBQWdCLENBQWhCLENBQWIsQ0FBZjtBQUNBRixlQUFTRyxRQUFULENBQWtCLENBQWxCLEVBQXFCbEMsU0FBU0ssTUFBOUI7QUFDQTBCLGVBQVNHLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUJKLFVBQXJCO0FBQ0EsYUFBTyxJQUFJSyxPQUFKLENBQVlaLGNBQVosRUFBNEJRLFNBQVNULE1BQXJDLEVBQTZDdEIsU0FBU0ssTUFBdEQsQ0FBUDtBQUNEOzs7MkJBRWN5QixVLEVBQVlNLE0sRUFBUWIsYyxFQUFnQjtBQUNqRCxVQUFJUSxXQUFXLElBQUlDLFFBQUosQ0FBYSxJQUFJQyxXQUFKLENBQWdCLENBQWhCLENBQWIsQ0FBZjtBQUNBRixlQUFTRyxRQUFULENBQWtCLENBQWxCLEVBQXFCbEMsU0FBU0MsTUFBOUI7QUFDQThCLGVBQVNHLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUJKLFVBQXJCO0FBQ0E7QUFDQUMsZUFBU00sU0FBVCxDQUFtQixDQUFuQixFQUFzQkQsTUFBdEIsRUFBOEIsSUFBOUI7QUFDQSxhQUFPLElBQUlELE9BQUosQ0FBWVosY0FBWixFQUE0QlEsU0FBU1QsTUFBckMsRUFBNkN0QixTQUFTQyxNQUF0RCxDQUFQO0FBQ0Q7OztnREFFbUNxQyxZLEVBQWNmLGMsRUFBZ0I7QUFDaEUsVUFBSVEsV0FBVyxJQUFJQyxRQUFKLENBQWEsSUFBSUMsV0FBSixDQUFnQixDQUFoQixDQUFiLENBQWY7QUFDQUYsZUFBU0csUUFBVCxDQUFrQixDQUFsQixFQUFxQmxDLFNBQVNFLE9BQTlCO0FBQ0E7QUFDQTZCLGVBQVNRLFNBQVQsQ0FBbUIsQ0FBbkIsRUFBc0JELFlBQXRCLEVBQW9DLElBQXBDO0FBQ0EsYUFBTyxJQUFJSCxPQUFKLENBQVlaLGNBQVosRUFBNEJRLFNBQVNULE1BQXJDLEVBQTZDdEIsU0FBU0UsT0FBdEQsQ0FBUDtBQUNEOzs7aUNBRW9Cb0IsTSxFQUFRQyxjLEVBQWdCO0FBQzNDLGFBQU8sSUFBSVksT0FBSixDQUFZWixjQUFaLEVBQTRCRCxNQUE1QixDQUFQO0FBQ0Q7Ozs2QkFFZ0JDLGMsRUFBZ0I7QUFDL0IsVUFBSVEsV0FBVyxJQUFJQyxRQUFKLENBQWEsSUFBSUMsV0FBSixDQUFnQixDQUFoQixDQUFiLENBQWY7QUFDQUYsZUFBU0csUUFBVCxDQUFrQixDQUFsQixFQUFxQmxDLFNBQVNHLGtCQUE5QjtBQUNBLGFBQU8sSUFBSWdDLE9BQUosQ0FBWVosY0FBWixFQUE0QlEsU0FBU1QsTUFBckMsRUFBNkN0QixTQUFTRyxrQkFBdEQsQ0FBUDtBQUNEOzs7NEJBRWVvQixjLEVBQWdCO0FBQzlCLFVBQUlRLFdBQVcsSUFBSUMsUUFBSixDQUFhLElBQUlDLFdBQUosQ0FBZ0IsQ0FBaEIsQ0FBYixDQUFmO0FBQ0FGLGVBQVNHLFFBQVQsQ0FBa0IsQ0FBbEIsRUFBcUJsQyxTQUFTSSxPQUE5QjtBQUNBLGFBQU8sSUFBSStCLE9BQUosQ0FBWVosY0FBWixFQUE0QlEsU0FBU1QsTUFBckMsRUFBNkN0QixTQUFTSSxPQUF0RCxDQUFQO0FBQ0Q7Ozs7O0FBR0hvQyxPQUFPQyxPQUFQLENBQWV4QixJQUFmLEdBQXNCQSxJQUF0QjtBQUNBdUIsT0FBT0MsT0FBUCxDQUFlekMsUUFBZixHQUEwQkEsUUFBMUI7QUFDQXdDLE9BQU9DLE9BQVAsQ0FBZWxDLFVBQWYsR0FBNEJBLFVBQTVCIiwiZmlsZSI6IlRhc2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuY29uc3QgVGFza1R5cGUgPSB7XHJcbiAgQ1JFQVRFOiAweDAxLFxyXG4gIFNFVF9QUk46IDB4MDIsXHJcbiAgQ0FMQ1VMQVRFX0NIRUNLU1VNOiAweDAzLFxyXG4gIEVYRUNVVEU6IDB4MDQsXHJcbiAgU0VMRUNUOiAweDA2LFxyXG4gIFJFU1BPTlNFX0NPREU6IDB4NjBcclxufVxyXG5cclxuY29uc3QgVGFza1Jlc3VsdCA9IHtcclxuICBJTlZBTElEX0NPREU6IDB4MDAsXHJcbiAgU1VDQ0VTUzogMHgwMSxcclxuICBPUENPREVfTk9UX1NVUFBPUlRFRDogMHgwMixcclxuICBJTlZBTElEX1BBUkFNRVRFUjogMHgwMyxcclxuICBJTlNVRkZJQ0lFTlRfUkVTT1VSQ0VTOiAweDA0LFxyXG4gIElOVkFMSURfT0JKRUNUOiAweDA1LFxyXG4gIFVOU1VQUE9SVEVEX1RZUEU6IDB4MDcsXHJcbiAgT1BFUkFUSU9OX05PVF9QRVJNSVRURUQ6IDB4MDgsXHJcbiAgT1BFUkFUSU9OX0ZBSUxFRDogMHgwQVxyXG59XHJcblxyXG5jbGFzcyBUYXNrIHtcclxuXHJcbiAgY29uc3RydWN0b3IgKGNoYXJhY3RlcmlzdGljVG9Xcml0ZVRvLCBieXRlc1RvV3JpdGUsIGNvbW1hbmRUb0V4ZWN1dGUpIHtcclxuICAgIHRoaXMub3Bjb2RlID0gY29tbWFuZFRvRXhlY3V0ZVxyXG4gICAgdGhpcy5idWZmZXIgPSBieXRlc1RvV3JpdGVcclxuICAgIHRoaXMuY2hhcmFjdGVyaXN0aWMgPSBjaGFyYWN0ZXJpc3RpY1RvV3JpdGVUb1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGFzeW5jIFdvcmtlciAodGFzaywgY2FsbGJhY2spIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IHRhc2suY2hhcmFjdGVyaXN0aWMud3JpdGVWYWx1ZSh0YXNrLmJ1ZmZlcilcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2FsbGJhY2soKVxyXG4gICAgICB9LCAxMDApXHJcbiAgICB9IGNhdGNoIChleGNlcHRpb24pIHtcclxuICAgICAgY29uc29sZS5sb2coZXhjZXB0aW9uKVxyXG4gICAgICBjYWxsYmFjaygnQkxFIFRyYW5zZmVyIEZhaWxlZCcpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgdmVyaWZ5IChvYmplY3RUeXBlLCBjaGFyYWN0ZXJpc3RpYykge1xyXG4gICAgbGV0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigyKSlcclxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KDAsIFRhc2tUeXBlLlNFTEVDVClcclxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KDEsIG9iamVjdFR5cGUpXHJcbiAgICByZXR1cm4gbmV3IERGVVRhc2soY2hhcmFjdGVyaXN0aWMsIGRhdGFWaWV3LmJ1ZmZlciwgVGFza1R5cGUuU0VMRUNUKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGNyZWF0ZSAob2JqZWN0VHlwZSwgbGVuZ3RoLCBjaGFyYWN0ZXJpc3RpYykge1xyXG4gICAgbGV0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcig2KSlcclxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KDAsIFRhc2tUeXBlLkNSRUFURSlcclxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KDEsIG9iamVjdFR5cGUpXHJcbiAgICAvKiogRGF0YSBsZW5ndGggc2V0IHRvIGxpdHRsZSBlbmRpYW4gY29udmVyc3Rpb24gKi9cclxuICAgIGRhdGFWaWV3LnNldFVpbnQzMigyLCBsZW5ndGgsIHRydWUpXHJcbiAgICByZXR1cm4gbmV3IERGVVRhc2soY2hhcmFjdGVyaXN0aWMsIGRhdGFWaWV3LmJ1ZmZlciwgVGFza1R5cGUuQ1JFQVRFKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIHNldFBhY2tldFJldHVybk5vdGlmaWNhdGlvbiAocGFja2FnZUNvdW50LCBjaGFyYWN0ZXJpc3RpYykge1xyXG4gICAgbGV0IGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigzKSlcclxuICAgIGRhdGFWaWV3LnNldFVpbnQ4KDAsIFRhc2tUeXBlLlNFVF9QUk4pXHJcbiAgICAvKiogU2V0IHRoZSBwYWNrYWdlIHJlY2VpdmVkIG5vdGlmaWNhdGlvbiB0byB0aGUgbnVtYmVyIG9mIGV4cGVjdGVkIHBhY2thZ2VzICovXHJcbiAgICBkYXRhVmlldy5zZXRVaW50MTYoMSwgcGFja2FnZUNvdW50LCB0cnVlKVxyXG4gICAgcmV0dXJuIG5ldyBERlVUYXNrKGNoYXJhY3RlcmlzdGljLCBkYXRhVmlldy5idWZmZXIsIFRhc2tUeXBlLlNFVF9QUk4pXHJcbiAgfVxyXG5cclxuICBzdGF0aWMgd3JpdGVQYWNrYWdlIChidWZmZXIsIGNoYXJhY3RlcmlzdGljKSB7XHJcbiAgICByZXR1cm4gbmV3IERGVVRhc2soY2hhcmFjdGVyaXN0aWMsIGJ1ZmZlcilcclxuICB9XHJcblxyXG4gIHN0YXRpYyBjaGVja3N1bSAoY2hhcmFjdGVyaXN0aWMpIHtcclxuICAgIGxldCBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMSkpXHJcbiAgICBkYXRhVmlldy5zZXRVaW50OCgwLCBUYXNrVHlwZS5DQUxDVUxBVEVfQ0hFQ0tTVU0pXHJcbiAgICByZXR1cm4gbmV3IERGVVRhc2soY2hhcmFjdGVyaXN0aWMsIGRhdGFWaWV3LmJ1ZmZlciwgVGFza1R5cGUuQ0FMQ1VMQVRFX0NIRUNLU1VNKVxyXG4gIH1cclxuXHJcbiAgc3RhdGljIGV4ZWN1dGUgKGNoYXJhY3RlcmlzdGljKSB7XHJcbiAgICBsZXQgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKVxyXG4gICAgZGF0YVZpZXcuc2V0VWludDgoMCwgVGFza1R5cGUuRVhFQ1VURSlcclxuICAgIHJldHVybiBuZXcgREZVVGFzayhjaGFyYWN0ZXJpc3RpYywgZGF0YVZpZXcuYnVmZmVyLCBUYXNrVHlwZS5FWEVDVVRFKVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMuVGFzayA9IFRhc2tcclxubW9kdWxlLmV4cG9ydHMuVGFza1R5cGUgPSBUYXNrVHlwZVxyXG5tb2R1bGUuZXhwb3J0cy5UYXNrUmVzdWx0ID0gVGFza1Jlc3VsdFxyXG4iXX0=