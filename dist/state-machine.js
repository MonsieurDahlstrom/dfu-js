'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _queue = require('async/queue');

var _queue2 = _interopRequireDefault(_queue);

var _firmware = require('./firmware');

var _dfu = require('./dfu');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StateMachineStates = {
  NOT_CONFIGURED: 0x00,
  IDLE: 0x01,
  TRANSFERING: 0x02,
  COMPLETE: 0x03,
  FAILED: 0x04
}; // import {WWSecureDFUObject} from './types'

var StateMachine = function () {
  function StateMachine() {
    (0, _classCallCheck3.default)(this, StateMachine);

    this.state = StateMachineStates.NOT_CONFIGURED;
    this.fileTransfers = (0, _queue2.default)(DFUTransfer.Worker, 1);
  }

  (0, _createClass3.default)(StateMachine, [{
    key: 'setControlPoint',
    value: function setControlPoint(webBluetoothCharacteristic) {
      this.controlpointCharacteristic = webBluetoothCharacteristic;
    }
  }, {
    key: 'setPacketPoint',
    value: function setPacketPoint(webBluetoothCharacteristic) {
      this.packetCharacteristic = webBluetoothCharacteristic;
    }
  }, {
    key: 'addTransfer',
    value: function addTransfer(transfer) {
      var _this = this;

      this.fileTransfers.push(transfer, function (error) {
        if (error) {
          _this.fileTransfers.kill();
        }
      });
    }
  }, {
    key: 'sendFirmware',
    value: function sendFirmware(firmware) {
      if (this.state !== StateMachineStates.IDLE) {
        throw Error("Can only initate transfer of firmare when idle");
      }
      if (firmware instanceof _firmware.Firmware === false) {
        throw Error("Expect firmware parameter to be of class Firmware");
      }
      this.addTransfer(new DFUTransfer(firmware.sections[0].dat, this, this.packetCharacteristic, this.controlpointCharacteristic, WWSecureDFUObject.COMMAND));
      this.addTransfer(new DFUTransfer(firmware.sections[0].bin, this, this.packetCharacteristic, this.controlpointCharacteristic, WWSecureDFUObject.DATA));
    }
  }]);
  return StateMachine;
}();

var _exports = module.exports = {};
_exports.States = StateMachineStates;
_exports.StateMachine = StateMachine;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdGF0ZS1tYWNoaW5lLmpzIl0sIm5hbWVzIjpbIlN0YXRlTWFjaGluZVN0YXRlcyIsIk5PVF9DT05GSUdVUkVEIiwiSURMRSIsIlRSQU5TRkVSSU5HIiwiQ09NUExFVEUiLCJGQUlMRUQiLCJTdGF0ZU1hY2hpbmUiLCJzdGF0ZSIsImZpbGVUcmFuc2ZlcnMiLCJERlVUcmFuc2ZlciIsIldvcmtlciIsIndlYkJsdWV0b290aENoYXJhY3RlcmlzdGljIiwiY29udHJvbHBvaW50Q2hhcmFjdGVyaXN0aWMiLCJwYWNrZXRDaGFyYWN0ZXJpc3RpYyIsInRyYW5zZmVyIiwicHVzaCIsImVycm9yIiwia2lsbCIsImZpcm13YXJlIiwiRXJyb3IiLCJhZGRUcmFuc2ZlciIsInNlY3Rpb25zIiwiZGF0IiwiV1dTZWN1cmVERlVPYmplY3QiLCJDT01NQU5EIiwiYmluIiwiREFUQSIsImV4cG9ydHMiLCJtb2R1bGUiLCJTdGF0ZXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTUEscUJBQXFCO0FBQ3pCQyxrQkFBZ0IsSUFEUztBQUV6QkMsUUFBTSxJQUZtQjtBQUd6QkMsZUFBYSxJQUhZO0FBSXpCQyxZQUFVLElBSmU7QUFLekJDLFVBQVE7QUFMaUIsQ0FBM0IsQyxDQUxBOztJQWFNQyxZO0FBRUosMEJBQWU7QUFBQTs7QUFDYixTQUFLQyxLQUFMLEdBQWFQLG1CQUFtQkMsY0FBaEM7QUFDQSxTQUFLTyxhQUFMLEdBQXFCLHFCQUFNQyxZQUFZQyxNQUFsQixFQUEwQixDQUExQixDQUFyQjtBQUNEOzs7O29DQUVnQkMsMEIsRUFBNEI7QUFDM0MsV0FBS0MsMEJBQUwsR0FBa0NELDBCQUFsQztBQUNEOzs7bUNBRWVBLDBCLEVBQTRCO0FBQzFDLFdBQUtFLG9CQUFMLEdBQTRCRiwwQkFBNUI7QUFDRDs7O2dDQUVZRyxRLEVBQVU7QUFBQTs7QUFDckIsV0FBS04sYUFBTCxDQUFtQk8sSUFBbkIsQ0FBd0JELFFBQXhCLEVBQWtDLFVBQUNFLEtBQUQsRUFBVztBQUMzQyxZQUFJQSxLQUFKLEVBQVc7QUFDVCxnQkFBS1IsYUFBTCxDQUFtQlMsSUFBbkI7QUFDRDtBQUNGLE9BSkQ7QUFLRDs7O2lDQUVhQyxRLEVBQVU7QUFDdEIsVUFBRyxLQUFLWCxLQUFMLEtBQWVQLG1CQUFtQkUsSUFBckMsRUFBMkM7QUFDekMsY0FBTWlCLE1BQU0sZ0RBQU4sQ0FBTjtBQUNEO0FBQ0QsVUFBR0QsMkNBQWlDLEtBQXBDLEVBQTJDO0FBQ3pDLGNBQU1DLE1BQU0sbURBQU4sQ0FBTjtBQUNEO0FBQ0QsV0FBS0MsV0FBTCxDQUFpQixJQUFJWCxXQUFKLENBQWdCUyxTQUFTRyxRQUFULENBQWtCLENBQWxCLEVBQXFCQyxHQUFyQyxFQUEwQyxJQUExQyxFQUFnRCxLQUFLVCxvQkFBckQsRUFBMkUsS0FBS0QsMEJBQWhGLEVBQTRHVyxrQkFBa0JDLE9BQTlILENBQWpCO0FBQ0EsV0FBS0osV0FBTCxDQUFpQixJQUFJWCxXQUFKLENBQWdCUyxTQUFTRyxRQUFULENBQWtCLENBQWxCLEVBQXFCSSxHQUFyQyxFQUEwQyxJQUExQyxFQUFnRCxLQUFLWixvQkFBckQsRUFBMkUsS0FBS0QsMEJBQWhGLEVBQTRHVyxrQkFBa0JHLElBQTlILENBQWpCO0FBQ0Q7Ozs7O0FBR0gsSUFBSUMsV0FBVUMsT0FBT0QsT0FBUCxHQUFpQixFQUEvQjtBQUNBQSxTQUFRRSxNQUFSLEdBQWlCN0Isa0JBQWpCO0FBQ0EyQixTQUFRckIsWUFBUixHQUF1QkEsWUFBdkIiLCJmaWxlIjoic3RhdGUtbWFjaGluZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGltcG9ydCB7V1dTZWN1cmVERlVPYmplY3R9IGZyb20gJy4vdHlwZXMnXHJcbmltcG9ydCBxdWV1ZSBmcm9tICdhc3luYy9xdWV1ZSdcclxuaW1wb3J0IHtGaXJtd2FyZSwgRmlybXdhcmVUeXBlfSBmcm9tICcuL2Zpcm13YXJlJ1xyXG5pbXBvcnQge1RyYW5zZmVyfSBmcm9tICcuL2RmdSdcclxuXHJcbmNvbnN0IFN0YXRlTWFjaGluZVN0YXRlcyA9IHtcclxuICBOT1RfQ09ORklHVVJFRDogMHgwMCxcclxuICBJRExFOiAweDAxLFxyXG4gIFRSQU5TRkVSSU5HOiAweDAyLFxyXG4gIENPTVBMRVRFOiAweDAzLFxyXG4gIEZBSUxFRDogMHgwNFxyXG59XHJcblxyXG5jbGFzcyBTdGF0ZU1hY2hpbmUge1xyXG5cclxuICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICB0aGlzLnN0YXRlID0gU3RhdGVNYWNoaW5lU3RhdGVzLk5PVF9DT05GSUdVUkVEXHJcbiAgICB0aGlzLmZpbGVUcmFuc2ZlcnMgPSBxdWV1ZShERlVUcmFuc2Zlci5Xb3JrZXIsIDEpXHJcbiAgfVxyXG5cclxuICBzZXRDb250cm9sUG9pbnQgKHdlYkJsdWV0b290aENoYXJhY3RlcmlzdGljKSB7XHJcbiAgICB0aGlzLmNvbnRyb2xwb2ludENoYXJhY3RlcmlzdGljID0gd2ViQmx1ZXRvb3RoQ2hhcmFjdGVyaXN0aWNcclxuICB9XHJcblxyXG4gIHNldFBhY2tldFBvaW50ICh3ZWJCbHVldG9vdGhDaGFyYWN0ZXJpc3RpYykge1xyXG4gICAgdGhpcy5wYWNrZXRDaGFyYWN0ZXJpc3RpYyA9IHdlYkJsdWV0b290aENoYXJhY3RlcmlzdGljXHJcbiAgfVxyXG5cclxuICBhZGRUcmFuc2ZlciAodHJhbnNmZXIpIHtcclxuICAgIHRoaXMuZmlsZVRyYW5zZmVycy5wdXNoKHRyYW5zZmVyLCAoZXJyb3IpID0+IHtcclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgdGhpcy5maWxlVHJhbnNmZXJzLmtpbGwoKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgc2VuZEZpcm13YXJlIChmaXJtd2FyZSkge1xyXG4gICAgaWYodGhpcy5zdGF0ZSAhPT0gU3RhdGVNYWNoaW5lU3RhdGVzLklETEUpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoXCJDYW4gb25seSBpbml0YXRlIHRyYW5zZmVyIG9mIGZpcm1hcmUgd2hlbiBpZGxlXCIpO1xyXG4gICAgfVxyXG4gICAgaWYoZmlybXdhcmUgaW5zdGFuY2VvZiBGaXJtd2FyZSA9PT0gZmFsc2UpIHtcclxuICAgICAgdGhyb3cgRXJyb3IoXCJFeHBlY3QgZmlybXdhcmUgcGFyYW1ldGVyIHRvIGJlIG9mIGNsYXNzIEZpcm13YXJlXCIpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5hZGRUcmFuc2ZlcihuZXcgREZVVHJhbnNmZXIoZmlybXdhcmUuc2VjdGlvbnNbMF0uZGF0LCB0aGlzLCB0aGlzLnBhY2tldENoYXJhY3RlcmlzdGljLCB0aGlzLmNvbnRyb2xwb2ludENoYXJhY3RlcmlzdGljLCBXV1NlY3VyZURGVU9iamVjdC5DT01NQU5EKSlcclxuICAgIHRoaXMuYWRkVHJhbnNmZXIobmV3IERGVVRyYW5zZmVyKGZpcm13YXJlLnNlY3Rpb25zWzBdLmJpbiwgdGhpcywgdGhpcy5wYWNrZXRDaGFyYWN0ZXJpc3RpYywgdGhpcy5jb250cm9scG9pbnRDaGFyYWN0ZXJpc3RpYywgV1dTZWN1cmVERlVPYmplY3QuREFUQSkpXHJcbiAgfVxyXG59XHJcblxyXG52YXIgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0ge307XHJcbmV4cG9ydHMuU3RhdGVzID0gU3RhdGVNYWNoaW5lU3RhdGVzXHJcbmV4cG9ydHMuU3RhdGVNYWNoaW5lID0gU3RhdGVNYWNoaW5lXHJcbiJdfQ==