'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DFUSecurePacket = exports.DFUSecureControlPoint = exports.DFUSecure = undefined;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _update = require('../models/update');

var _firmware = require('../models/firmware');

var _transfer = require('../models/transfer');

var _transfer2 = _interopRequireDefault(_transfer);

var _transferObject = require('../models/transfer-object');

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DFU_BASE = '0000xxxx-0000-1000-8000-00805f9b34fb';
var DFUSecure = exports.DFUSecure = DFU_BASE.replace('xxxx', 'fe59');
var DFU_CHAR_BASE = '8ec9xxxx-f315-4f60-9fb8-838830daea50';
var DFUSecureControlPoint = exports.DFUSecureControlPoint = DFU_CHAR_BASE.replace('xxxx', '0001');
var DFUSecurePacket = exports.DFUSecurePacket = DFU_CHAR_BASE.replace('xxxx', '0002');

var DFUCharacteristicsForDevice = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(device) {
    var service, packetPoint, controlPoint;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return device.gatt.getPrimaryService(DFUSecure);

          case 2:
            service = _context.sent;
            _context.next = 5;
            return service.getCharacteristic(DFUSecurePacket);

          case 5:
            packetPoint = _context.sent;
            _context.next = 8;
            return service.getCharacteristic(DFUSecureControlPoint);

          case 8:
            controlPoint = _context.sent;
            return _context.abrupt('return', { identifier: device.id, packetPoint: packetPoint, controlPoint: controlPoint });

          case 10:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function DFUCharacteristicsForDevice(_x) {
    return _ref.apply(this, arguments);
  };
}();

var UpdateActions = {
  webBluetoothDFUCreateUpdate: function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(_ref2, bluetoothDevice) {
      var dispatch = _ref2.dispatch,
          commit = _ref2.commit;
      var metadata, update;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return DFUCharacteristicsForDevice(bluetoothDevice);

            case 2:
              metadata = _context2.sent;
              update = new _update.Update(metadata.identifier, metadata.controlPoint, metadata.packetPoint);

              commit(MutationTypes.ADD_UPDATE, update);

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function webBluetoothDFUCreateUpdate(_x2, _x3) {
      return _ref3.apply(this, arguments);
    }

    return webBluetoothDFUCreateUpdate;
  }(),
  webBluetoothDFURemoveUpdate: function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref4, update) {
      var dispatch = _ref4.dispatch,
          commit = _ref4.commit;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              commit(MutationTypes.REMOVE_UPDATE, update);

            case 1:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function webBluetoothDFURemoveUpdate(_x4, _x5) {
      return _ref5.apply(this, arguments);
    }

    return webBluetoothDFURemoveUpdate;
  }(),
  webBluetoothDFUCancelUpdate: function () {
    var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref6, update) {
      var dispatch = _ref6.dispatch,
          commit = _ref6.commit;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              update.state = _update.UpdateStates.FAILED;
              commit(MutationTypes.MODIFED_UPDATE, update);

            case 2:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function webBluetoothDFUCancelUpdate(_x6, _x7) {
      return _ref7.apply(this, arguments);
    }

    return webBluetoothDFUCancelUpdate;
  }(),
  webBluetoothDFURestoreUpdate: function () {
    var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref8, payload) {
      var dispatch = _ref8.dispatch,
          commit = _ref8.commit;
      var metadata;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return DFUCharacteristicsForDevice(payload.bluetoothDevice);

            case 2:
              metadata = _context5.sent;

              payload.update.setControlPoint(metadata.controlPoint);
              payload.update.setPacketPoint(metadata.packetPoint);
              payload.update.setDeviceIdentifier(payload.bluetoothDevice.id);
              commit(MutationTypes.MODIFED_UPDATE, payload.update);

            case 7:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function webBluetoothDFURestoreUpdate(_x8, _x9) {
      return _ref9.apply(this, arguments);
    }

    return webBluetoothDFURestoreUpdate;
  }(),
  webBluetoothDFUSendFirmware: function () {
    var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(_ref10, payload) {
      var dispatch = _ref10.dispatch,
          commit = _ref10.commit;

      var firmware, update, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, section;

      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              firmware = payload.firmware;
              update = payload.update;

              if (!(firmware instanceof _firmware.Firmware && update instanceof _update.Update)) {
                _context6.next = 25;
                break;
              }

              if (!(update.state === _update.UpdateStates.IDLE)) {
                _context6.next = 25;
                break;
              }

              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context6.prev = 7;

              for (_iterator = (0, _getIterator3.default)(firmware.sections); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                section = _step.value;

                update.transfers.push(new _transfer2.default(section.dat, update.controlpointCharacteristic, update.packetCharacteristic, _transferObject.TransferObjectType.Command));
                update.transfers[update.transfers.length - 1].update = update;
                dispatch('webBluetoothDFUTransferAdd', update.transfers[update.transfers.length - 1]);
                update.transfers.push(new _transfer2.default(section.bin, update.controlpointCharacteristic, update.packetCharacteristic, _transferObject.TransferObjectType.Data));
                update.transfers[update.transfers.length - 1].update = update;
                dispatch('webBluetoothDFUTransferAdd', update.transfers[update.transfers.length - 1]);
              }
              _context6.next = 15;
              break;

            case 11:
              _context6.prev = 11;
              _context6.t0 = _context6['catch'](7);
              _didIteratorError = true;
              _iteratorError = _context6.t0;

            case 15:
              _context6.prev = 15;
              _context6.prev = 16;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 18:
              _context6.prev = 18;

              if (!_didIteratorError) {
                _context6.next = 21;
                break;
              }

              throw _iteratorError;

            case 21:
              return _context6.finish(18);

            case 22:
              return _context6.finish(15);

            case 23:
              dispatch('webBluetoothDFUTransferBegin', update.transfers[0]);
              commit(MutationTypes.MODIFED_UPDATE, update);

            case 25:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this, [[7, 11, 15, 23], [16,, 18, 22]]);
    }));

    function webBluetoothDFUSendFirmware(_x10, _x11) {
      return _ref11.apply(this, arguments);
    }

    return webBluetoothDFUSendFirmware;
  }()
};

exports.default = UpdateActions;
//# sourceMappingURL=update-actions.js.map