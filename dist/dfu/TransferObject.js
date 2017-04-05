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
  function TransferObject(dataslice, offset, type, dfuTransfer, onCompletition) {
    (0, _classCallCheck3.default)(this, TransferObject);

    this.completitionCB = onCompletition;
    this.parentTransfer = dfuTransfer;
    this.state = DFUObjectState.NotStarted;
    this.dataslice = dataslice;
    this.offset = offset;
    this.objectType = type;
    this.crc = _crc2.default.crc32(dataslice);
    this.chunks = [];
    var counter = 0;
    while (this.dataslice.length > counter * DATA_CHUNK_SIZE) {
      this.chunks.push(this.dataslice.slice(counter * DATA_CHUNK_SIZE, counter * DATA_CHUNK_SIZE + DATA_CHUNK_SIZE));
      counter++;
    }
  }

  (0, _createClass3.default)(TransferObject, [{
    key: 'begin',
    value: function begin() {
      this.state = DFUObjectState.Creating;
      this.parentTransfer.addTask(DFUTask.verify(this.objectType, this.parentTransfer.controlPoint));
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
      if (offset !== this.offset + this.dataslice.length && checksum !== this.crc) {
        if (offset === 0 || offset > this.offset + this.dataslice.length || checksum !== this.crc) {
          this.state = DFUObjectState.Creating;
          var operation = DFUTask.create(this.objectType, this.dataslice.length, this.parentTransfer.controlPoint);
          this.parentTransfer.addTask(operation);
        } else {
          this.transfer(offset);
        }
      } else {
        this.state = DFUObjectState.Storing;
        var _operation = DFUTask.execute(this.parentTransfer.controlPoint);
        this.parentTransfer.addTask(_operation);
      }
    }
  }, {
    key: 'transfer',
    value: function transfer(offset) {
      for (var index = 0; index < this.chunks.length; index++) {
        var buffer = this.chunks[index].buffer;
        this.parentTransfer.addTask(DFUTask.writePackage(buffer, this.parentTransfer.packetPoint));
      }
      // this.parentTransfer.addTask(DFUTask.checksum(this.parentTransfer.controlPoint))
    }
  }, {
    key: 'setPacketReturnNotification',
    value: function setPacketReturnNotification() {
      return DFUTask.setPacketReturnNotification(this.chunks.length, this.parentTransfer.controlPoint);
    }
  }, {
    key: 'eventHandler',
    value: function eventHandler(dataView) {
      /** Depending on which state this object is handle the relevent opcodes */
      var opCode = dataView.getInt8(1);
      var responseCode = dataView.getInt8(2);
      switch (this.state) {
        case DFUObjectState.Creating:
          {
            if (opCode === WWSecureDFUOperations.SELECT && responseCode === DFUOperationResults.SUCCESS) {
              this.onSelect(dataView);
            } else if (opCode === WWSecureDFUOperations.CREATE && responseCode === DFUOperationResults.SUCCESS) {
              this.onCreate(dataView);
            } else if (opCode === WWSecureDFUOperations.SET_PRN && responseCode === DFUOperationResults.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
        case DFUObjectState.Transfering:
          {
            if (opCode === WWSecureDFUOperations.CALCULATE_CHECKSUM && responseCode === DFUOperationResults.SUCCESS) {
              this.onChecksum(dataView);
            } else if (opCode === WWSecureDFUOperations.SET_PRN && responseCode === DFUOperationResults.SUCCESS) {
              this.onPacketNotification(dataView);
            } else {
              console.log('  Operation: ' + opCode + ' Result: ' + responseCode);
            }
            break;
          }
        case DFUObjectState.Storing:
          {
            if (opCode === WWSecureDFUOperations.EXECUTE && responseCode === DFUOperationResults.SUCCESS) {
              this.onExecute();
            } else if (opCode === WWSecureDFUOperations.SET_PRN && responseCode === WWSecureDFUOperations.SUCCESS) {
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
      this.state = DFUObjectState.Transfering;
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
      this.state = DFUObjectState.Completed;
      this.completitionCB();
    }
  }]);
  return TransferObject;
}();

module.exports.TransferObject = TransferObject;
module.exports.TransferObjectState = TransferObjectState;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kZnUvVHJhbnNmZXJPYmplY3QuanMiXSwibmFtZXMiOlsiREFUQV9DSFVOS19TSVpFIiwiVHJhbnNmZXJPYmplY3RTdGF0ZSIsIk5vdFN0YXJ0ZWQiLCJDcmVhdGluZyIsIlRyYW5zZmVyaW5nIiwiU3RvcmluZyIsIkNvbXBsZXRlZCIsIkZhaWxlZCIsIlRyYW5zZmVyT2JqZWN0IiwiZGF0YXNsaWNlIiwib2Zmc2V0IiwidHlwZSIsImRmdVRyYW5zZmVyIiwib25Db21wbGV0aXRpb24iLCJjb21wbGV0aXRpb25DQiIsInBhcmVudFRyYW5zZmVyIiwic3RhdGUiLCJERlVPYmplY3RTdGF0ZSIsIm9iamVjdFR5cGUiLCJjcmMiLCJjcmMzMiIsImNodW5rcyIsImNvdW50ZXIiLCJsZW5ndGgiLCJwdXNoIiwic2xpY2UiLCJhZGRUYXNrIiwiREZVVGFzayIsInZlcmlmeSIsImNvbnRyb2xQb2ludCIsImRhdGFWaWV3IiwiY3VycmVudE9mZnNldCIsImdldFVpbnQzMiIsImN1cnJlbnRDUkMiLCJzZXRQYWNrZXRSZXR1cm5Ob3RpZmljYXRpb24iLCJ2YWxpZGF0ZSIsImNoZWNrc3VtIiwib3BlcmF0aW9uIiwiY3JlYXRlIiwidHJhbnNmZXIiLCJleGVjdXRlIiwiaW5kZXgiLCJidWZmZXIiLCJ3cml0ZVBhY2thZ2UiLCJwYWNrZXRQb2ludCIsIm9wQ29kZSIsImdldEludDgiLCJyZXNwb25zZUNvZGUiLCJXV1NlY3VyZURGVU9wZXJhdGlvbnMiLCJTRUxFQ1QiLCJERlVPcGVyYXRpb25SZXN1bHRzIiwiU1VDQ0VTUyIsIm9uU2VsZWN0IiwiQ1JFQVRFIiwib25DcmVhdGUiLCJTRVRfUFJOIiwib25QYWNrZXROb3RpZmljYXRpb24iLCJjb25zb2xlIiwibG9nIiwiQ0FMQ1VMQVRFX0NIRUNLU1VNIiwib25DaGVja3N1bSIsIkVYRUNVVEUiLCJvbkV4ZWN1dGUiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7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c0IsSUFBdEIsQ0FBZjtBQUNBLFdBQUtHLFFBQUwsQ0FBY3pCLE1BQWQsRUFBc0IwQixRQUF0QjtBQUNEOzs7eUNBRXFCTixRLEVBQVUsQ0FDL0I7Ozs4QkFFVUEsUSxFQUFVO0FBQ25CLFdBQUtkLEtBQUwsR0FBYUMsZUFBZVgsU0FBNUI7QUFDQSxXQUFLUSxjQUFMO0FBQ0Q7Ozs7O0FBR0hpRCxPQUFPQyxPQUFQLENBQWV4RCxjQUFmLEdBQWdDQSxjQUFoQztBQUNBdUQsT0FBT0MsT0FBUCxDQUFlL0QsbUJBQWYsR0FBcUNBLG1CQUFyQyIsImZpbGUiOiJUcmFuc2Zlck9iamVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBjcmMgZnJvbSAnY3JjJ1xyXG5pbXBvcnQge1Rhc2ssIFRhc2tUeXBlLCBUYXNrUmVzdWx0fSBmcm9tICcuL1Rhc2snXHJcblxyXG5jb25zdCBEQVRBX0NIVU5LX1NJWkUgPSAyMFxyXG5cclxuY29uc3QgVHJhbnNmZXJPYmplY3RTdGF0ZSA9IHtcclxuICBOb3RTdGFydGVkOiAweDAxLFxyXG4gIENyZWF0aW5nOiAweDAyLFxyXG4gIFRyYW5zZmVyaW5nOiAweDAzLFxyXG4gIFN0b3Jpbmc6IDB4MDQsXHJcbiAgQ29tcGxldGVkOiAweDA1LFxyXG4gIEZhaWxlZDogMHgwNlxyXG59XHJcblxyXG5jbGFzcyBUcmFuc2Zlck9iamVjdCB7XHJcblxyXG4gIGNvbnN0cnVjdG9yIChkYXRhc2xpY2UsIG9mZnNldCwgdHlwZSwgZGZ1VHJhbnNmZXIsIG9uQ29tcGxldGl0aW9uKSB7XHJcbiAgICB0aGlzLmNvbXBsZXRpdGlvbkNCID0gb25Db21wbGV0aXRpb25cclxuICAgIHRoaXMucGFyZW50VHJhbnNmZXIgPSBkZnVUcmFuc2ZlclxyXG4gICAgdGhpcy5zdGF0ZSA9IERGVU9iamVjdFN0YXRlLk5vdFN0YXJ0ZWRcclxuICAgIHRoaXMuZGF0YXNsaWNlID0gZGF0YXNsaWNlXHJcbiAgICB0aGlzLm9mZnNldCA9IG9mZnNldFxyXG4gICAgdGhpcy5vYmplY3RUeXBlID0gdHlwZVxyXG4gICAgdGhpcy5jcmMgPSBjcmMuY3JjMzIoZGF0YXNsaWNlKVxyXG4gICAgdGhpcy5jaHVua3MgPSBbXVxyXG4gICAgbGV0IGNvdW50ZXIgPSAwXHJcbiAgICB3aGlsZSAodGhpcy5kYXRhc2xpY2UubGVuZ3RoID4gY291bnRlciAqIERBVEFfQ0hVTktfU0laRSkge1xyXG4gICAgICB0aGlzLmNodW5rcy5wdXNoKHRoaXMuZGF0YXNsaWNlLnNsaWNlKGNvdW50ZXIgKiBEQVRBX0NIVU5LX1NJWkUsIGNvdW50ZXIgKiBEQVRBX0NIVU5LX1NJWkUgKyBEQVRBX0NIVU5LX1NJWkUpKVxyXG4gICAgICBjb3VudGVyKytcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGJlZ2luICgpIHtcclxuICAgIHRoaXMuc3RhdGUgPSBERlVPYmplY3RTdGF0ZS5DcmVhdGluZ1xyXG4gICAgdGhpcy5wYXJlbnRUcmFuc2Zlci5hZGRUYXNrKERGVVRhc2sudmVyaWZ5KHRoaXMub2JqZWN0VHlwZSwgdGhpcy5wYXJlbnRUcmFuc2Zlci5jb250cm9sUG9pbnQpKVxyXG4gIH1cclxuXHJcbiAgdmVyaWZ5IChkYXRhVmlldykge1xyXG4gICAgbGV0IGN1cnJlbnRPZmZzZXQgPSBkYXRhVmlldy5nZXRVaW50MzIoNywgdHJ1ZSlcclxuICAgIGxldCBjdXJyZW50Q1JDID0gZGF0YVZpZXcuZ2V0VWludDMyKDExLCB0cnVlKVxyXG4gICAgdGhpcy5wYXJlbnRUcmFuc2Zlci5hZGRUYXNrKHRoaXMuc2V0UGFja2V0UmV0dXJuTm90aWZpY2F0aW9uKCkpXHJcbiAgICB0aGlzLnZhbGlkYXRlKGN1cnJlbnRPZmZzZXQsIGN1cnJlbnRDUkMpXHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZSAob2Zmc2V0LCBjaGVja3N1bSkge1xyXG4gICAgaWYgKG9mZnNldCAhPT0gdGhpcy5vZmZzZXQgKyB0aGlzLmRhdGFzbGljZS5sZW5ndGggJiYgY2hlY2tzdW0gIT09IHRoaXMuY3JjKSB7XHJcbiAgICAgIGlmIChvZmZzZXQgPT09IDAgfHwgb2Zmc2V0ID4gdGhpcy5vZmZzZXQgKyB0aGlzLmRhdGFzbGljZS5sZW5ndGggfHwgY2hlY2tzdW0gIT09IHRoaXMuY3JjKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IERGVU9iamVjdFN0YXRlLkNyZWF0aW5nXHJcbiAgICAgICAgbGV0IG9wZXJhdGlvbiA9IERGVVRhc2suY3JlYXRlKHRoaXMub2JqZWN0VHlwZSwgdGhpcy5kYXRhc2xpY2UubGVuZ3RoLCB0aGlzLnBhcmVudFRyYW5zZmVyLmNvbnRyb2xQb2ludClcclxuICAgICAgICB0aGlzLnBhcmVudFRyYW5zZmVyLmFkZFRhc2sob3BlcmF0aW9uKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMudHJhbnNmZXIob2Zmc2V0KVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLnN0YXRlID0gREZVT2JqZWN0U3RhdGUuU3RvcmluZ1xyXG4gICAgICBsZXQgb3BlcmF0aW9uID0gREZVVGFzay5leGVjdXRlKHRoaXMucGFyZW50VHJhbnNmZXIuY29udHJvbFBvaW50KVxyXG4gICAgICB0aGlzLnBhcmVudFRyYW5zZmVyLmFkZFRhc2sob3BlcmF0aW9uKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdHJhbnNmZXIgKG9mZnNldCkge1xyXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuY2h1bmtzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICBsZXQgYnVmZmVyID0gdGhpcy5jaHVua3NbaW5kZXhdLmJ1ZmZlclxyXG4gICAgICB0aGlzLnBhcmVudFRyYW5zZmVyLmFkZFRhc2soREZVVGFzay53cml0ZVBhY2thZ2UoYnVmZmVyLCB0aGlzLnBhcmVudFRyYW5zZmVyLnBhY2tldFBvaW50KSlcclxuICAgIH1cclxuICAgIC8vIHRoaXMucGFyZW50VHJhbnNmZXIuYWRkVGFzayhERlVUYXNrLmNoZWNrc3VtKHRoaXMucGFyZW50VHJhbnNmZXIuY29udHJvbFBvaW50KSlcclxuICB9XHJcblxyXG4gIHNldFBhY2tldFJldHVybk5vdGlmaWNhdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gREZVVGFzay5zZXRQYWNrZXRSZXR1cm5Ob3RpZmljYXRpb24odGhpcy5jaHVua3MubGVuZ3RoLCB0aGlzLnBhcmVudFRyYW5zZmVyLmNvbnRyb2xQb2ludClcclxuICB9XHJcblxyXG4gIGV2ZW50SGFuZGxlciAoZGF0YVZpZXcpIHtcclxuICAgIC8qKiBEZXBlbmRpbmcgb24gd2hpY2ggc3RhdGUgdGhpcyBvYmplY3QgaXMgaGFuZGxlIHRoZSByZWxldmVudCBvcGNvZGVzICovXHJcbiAgICBsZXQgb3BDb2RlID0gZGF0YVZpZXcuZ2V0SW50OCgxKVxyXG4gICAgbGV0IHJlc3BvbnNlQ29kZSA9IGRhdGFWaWV3LmdldEludDgoMilcclxuICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICBjYXNlIERGVU9iamVjdFN0YXRlLkNyZWF0aW5nOiB7XHJcbiAgICAgICAgaWYgKG9wQ29kZSA9PT0gV1dTZWN1cmVERlVPcGVyYXRpb25zLlNFTEVDVCAmJiByZXNwb25zZUNvZGUgPT09IERGVU9wZXJhdGlvblJlc3VsdHMuU1VDQ0VTUykge1xyXG4gICAgICAgICAgdGhpcy5vblNlbGVjdChkYXRhVmlldylcclxuICAgICAgICB9IGVsc2UgaWYgKG9wQ29kZSA9PT0gV1dTZWN1cmVERlVPcGVyYXRpb25zLkNSRUFURSAmJiByZXNwb25zZUNvZGUgPT09IERGVU9wZXJhdGlvblJlc3VsdHMuU1VDQ0VTUykge1xyXG4gICAgICAgICAgdGhpcy5vbkNyZWF0ZShkYXRhVmlldylcclxuICAgICAgICB9IGVsc2UgaWYgKG9wQ29kZSA9PT0gV1dTZWN1cmVERlVPcGVyYXRpb25zLlNFVF9QUk4gJiYgcmVzcG9uc2VDb2RlID09PSBERlVPcGVyYXRpb25SZXN1bHRzLlNVQ0NFU1MpIHtcclxuICAgICAgICAgIHRoaXMub25QYWNrZXROb3RpZmljYXRpb24oZGF0YVZpZXcpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKCcgIE9wZXJhdGlvbjogJyArIG9wQ29kZSArICcgUmVzdWx0OiAnICsgcmVzcG9uc2VDb2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBicmVha1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgREZVT2JqZWN0U3RhdGUuVHJhbnNmZXJpbmc6IHtcclxuICAgICAgICBpZiAob3BDb2RlID09PSBXV1NlY3VyZURGVU9wZXJhdGlvbnMuQ0FMQ1VMQVRFX0NIRUNLU1VNICYmIHJlc3BvbnNlQ29kZSA9PT0gREZVT3BlcmF0aW9uUmVzdWx0cy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICB0aGlzLm9uQ2hlY2tzdW0oZGF0YVZpZXcpXHJcbiAgICAgICAgfSBlbHNlIGlmIChvcENvZGUgPT09IFdXU2VjdXJlREZVT3BlcmF0aW9ucy5TRVRfUFJOICYmIHJlc3BvbnNlQ29kZSA9PT0gREZVT3BlcmF0aW9uUmVzdWx0cy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICB0aGlzLm9uUGFja2V0Tm90aWZpY2F0aW9uKGRhdGFWaWV3KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnICBPcGVyYXRpb246ICcgKyBvcENvZGUgKyAnIFJlc3VsdDogJyArIHJlc3BvbnNlQ29kZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgICBjYXNlIERGVU9iamVjdFN0YXRlLlN0b3Jpbmc6IHtcclxuICAgICAgICBpZiAob3BDb2RlID09PSBXV1NlY3VyZURGVU9wZXJhdGlvbnMuRVhFQ1VURSAmJiByZXNwb25zZUNvZGUgPT09IERGVU9wZXJhdGlvblJlc3VsdHMuU1VDQ0VTUykge1xyXG4gICAgICAgICAgdGhpcy5vbkV4ZWN1dGUoKVxyXG4gICAgICAgIH0gZWxzZSBpZiAob3BDb2RlID09PSBXV1NlY3VyZURGVU9wZXJhdGlvbnMuU0VUX1BSTiAmJiByZXNwb25zZUNvZGUgPT09IFdXU2VjdXJlREZVT3BlcmF0aW9ucy5TVUNDRVNTKSB7XHJcbiAgICAgICAgICB0aGlzLm9uUGFja2V0Tm90aWZpY2F0aW9uKGRhdGFWaWV3KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnICBPcGVyYXRpb246ICcgKyBvcENvZGUgKyAnIFJlc3VsdDogJyArIHJlc3BvbnNlQ29kZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25TZWxlY3QgKGRhdGFWaWV3KSB7XHJcbiAgICAvKiogdmVyaWZ5IGhvdyBtdWNoIGhvdyB0aGUgdHJhbnNmZXIgdGhhdCBoYXMgYmVlbiBjb21wbGV0ZWQgKi9cclxuICAgIHRoaXMudmVyaWZ5KGRhdGFWaWV3KVxyXG4gIH1cclxuXHJcbiAgb25DcmVhdGUgKGRhdGFWaWV3KSB7XHJcbiAgICB0aGlzLnN0YXRlID0gREZVT2JqZWN0U3RhdGUuVHJhbnNmZXJpbmdcclxuICAgIC8qKiBzdGFydCB0aGUgdHJhbnNmZXIgb2YgdGhlIG9iamVjdCAgKi9cclxuICAgIHRoaXMudHJhbnNmZXIoMClcclxuICB9XHJcblxyXG4gIG9uQ2hlY2tzdW0gKGRhdGFWaWV3KSB7XHJcbiAgICBsZXQgb2Zmc2V0ID0gZGF0YVZpZXcuZ2V0VWludDMyKDMsIHRydWUpXHJcbiAgICBsZXQgY2hlY2tzdW0gPSBkYXRhVmlldy5nZXRVaW50MzIoNywgdHJ1ZSlcclxuICAgIHRoaXMudmFsaWRhdGUob2Zmc2V0LCBjaGVja3N1bSlcclxuICB9XHJcblxyXG4gIG9uUGFja2V0Tm90aWZpY2F0aW9uIChkYXRhVmlldykge1xyXG4gIH1cclxuXHJcbiAgb25FeGVjdXRlIChkYXRhVmlldykge1xyXG4gICAgdGhpcy5zdGF0ZSA9IERGVU9iamVjdFN0YXRlLkNvbXBsZXRlZFxyXG4gICAgdGhpcy5jb21wbGV0aXRpb25DQigpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5UcmFuc2Zlck9iamVjdCA9IFRyYW5zZmVyT2JqZWN0XHJcbm1vZHVsZS5leHBvcnRzLlRyYW5zZmVyT2JqZWN0U3RhdGUgPSBUcmFuc2Zlck9iamVjdFN0YXRlXHJcbiJdfQ==