'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _write = require('../models/write');

var _write2 = _interopRequireDefault(_write);

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

var _transmissionTypes = require('../models/transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

var _transferObject = require('../models/transfer-object');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GenerateObjects = function GenerateObjects(dispatch, transfer) {
  var fileBegin = 0;
  var fileEnd = transfer.file.length;
  var index = fileBegin;
  while (index < fileEnd) {
    var objectBegin = index;
    var objectEnd = objectBegin + transfer.maxObjectLength < fileEnd ? transfer.maxObjectLength : fileEnd - index;
    var object = new _transferObject.TransferObject(objectBegin, objectEnd, transfer, transfer.objectType);
    object.transfer = transfer;
    transfer.objects.push(object);
    dispatch('webBluetoothDFUObjectAdd', object);
    index += transfer.maxObjectLength;
  }
};

var TransferActions = {
  webBluetoothDFUTransferAdd: function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref, transfer) {
      var dispatch = _ref.dispatch,
          commit = _ref.commit;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              transfer.controlPointEventHandler = function (event) {
                dispatch('webBluetoothDFUTransferEventHandler', { transfer: transfer, dataView: event.target.value });
              };
              transfer.controlPoint.addEventListener('characteristicvaluechanged', transfer.controlPointEventHandler);
              commit(MutationTypes.ADD_TRANSFER, transfer);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function webBluetoothDFUTransferAdd(_x, _x2) {
      return _ref2.apply(this, arguments);
    }

    return webBluetoothDFUTransferAdd;
  }(),
  webBluetoothDFUTransferRemove: function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(_ref3, transfer) {
      var dispatch = _ref3.dispatch,
          commit = _ref3.commit;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              transfer.controlPoint.removeEventListener('characteristicvaluechanged', transfer.controlPointEventHandler);
              commit(MutationTypes.REMOVE_TRANSFER, transfer);

            case 2:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function webBluetoothDFUTransferRemove(_x3, _x4) {
      return _ref4.apply(this, arguments);
    }

    return webBluetoothDFUTransferRemove;
  }(),
  webBluetoothDFUTransferBegin: function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref5, transfer) {
      var dispatch = _ref5.dispatch,
          commit = _ref5.commit;
      var write;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              write = new _write2.default.Verify(transfer.controlPoint, transfer.objectType);

              dispatch('webBluetoothDFUScheduleWrite', write);
              dispatch('webBluetoothDFUExecuteWrite', write);
              commit(MutationTypes.UPDATE_TRANSFER, transfer);

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function webBluetoothDFUTransferBegin(_x5, _x6) {
      return _ref6.apply(this, arguments);
    }

    return webBluetoothDFUTransferBegin;
  }(),
  webBluetoothDFUTransferPrepare: function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref7, payload) {
      var dispatch = _ref7.dispatch,
          commit = _ref7.commit;
      var transfer, maxiumSize, currentOffset, currentCRC, object, validatePayload;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              transfer = payload.transfer;
              maxiumSize = payload.maxiumSize;
              currentOffset = payload.offset;
              currentCRC = payload.checksum;

              transfer.maxObjectLength = maxiumSize;
              transfer.objects = [];
              transfer.currentObjectIndex = 0;
              GenerateObjects(dispatch, transfer);
              object = transfer.objects.find(function (item) {
                return item.hasOffset(currentOffset);
              });

              if (object) {
                transfer.currentObjectIndex = transfer.objects.indexOf(object);
              }
              transfer.state = _transmissionTypes2.default.Transfering;
              validatePayload = { checksum: currentCRC, offset: currentOffset, transferObject: transfer.objects[transfer.currentObjectIndex] };

              dispatch('webBluetoothDFUObjectValidate', validatePayload);
              commit(MutationTypes.UPDATE_TRANSFER, transfer);

            case 14:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function webBluetoothDFUTransferPrepare(_x7, _x8) {
      return _ref8.apply(this, arguments);
    }

    return webBluetoothDFUTransferPrepare;
  }(),
  webBluetoothDFUTransferNextObject: function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref9, transfer) {
      var dispatch = _ref9.dispatch,
          commit = _ref9.commit;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (transfer.currentObjectIndex < transfer.objects.length - 1) {
                transfer.currentObjectIndex++;
                dispatch('webBluetoothDFUObjectBegin', transfer.objects[transfer.currentObjectIndex]);
              } else {
                transfer.state = _transmissionTypes2.default.Completed;
              }
              commit(MutationTypes.UPDATE_TRANSFER, transfer);

            case 2:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function webBluetoothDFUTransferNextObject(_x9, _x10) {
      return _ref10.apply(this, arguments);
    }

    return webBluetoothDFUTransferNextObject;
  }(),
  webBluetoothDFUTransferEventHandler: function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(_ref11, payload) {
      var dispatch = _ref11.dispatch,
          commit = _ref11.commit;
      var dataView, transfer, opCode, responseCode, transferObject;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              dataView = payload.dataView;
              transfer = payload.transfer;

              if (!(dataView.getInt8(0) !== _write2.default.Actions.RESPONSE_CODE)) {
                _context6.next = 4;
                break;
              }

              return _context6.abrupt('return');

            case 4:
              _context6.t0 = transfer.state;
              _context6.next = _context6.t0 === _transmissionTypes2.default.Prepare ? 7 : 11;
              break;

            case 7:
              opCode = dataView.getInt8(1);
              responseCode = dataView.getInt8(2);

              if (opCode === _write2.default.Actions.SELECT && responseCode === _write2.default.Responses.SUCCESS) {
                dispatch('webBluetoothDFUTransferPrepare', { checksum: dataView.getUint32(11, true), offset: dataView.getUint32(7, true), maxiumSize: dataView.getUint32(3, true), transfer: transfer });
              }
              return _context6.abrupt('break', 13);

            case 11:
              if (transfer.currentObjectIndex >= 0) {
                transferObject = transfer.objects[transfer.currentObjectIndex];

                if (transferObject) {
                  dispatch('webBluetoothDFUObjectHandleEvent', { dataView: dataView, transferObject: transferObject });
                }
              }
              return _context6.abrupt('break', 13);

            case 13:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function webBluetoothDFUTransferEventHandler(_x11, _x12) {
      return _ref12.apply(this, arguments);
    }

    return webBluetoothDFUTransferEventHandler;
  }()
};

exports.default = TransferActions;
//# sourceMappingURL=transfer-actions.js.map