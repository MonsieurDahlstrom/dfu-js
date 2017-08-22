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

var GenerateObjects = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(dispatch, transfer) {
    var fileBegin, fileEnd, index, objectBegin, objectEnd, object;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fileBegin = 0;
            fileEnd = transfer.file.length;
            index = fileBegin;

            while (index < fileEnd) {
              objectBegin = index;
              objectEnd = objectBegin + transfer.maxObjectLength < fileEnd ? transfer.maxObjectLength : fileEnd - index;
              object = new _transferObject.TransferObject(objectBegin, objectEnd, transfer, transfer.objectType);

              object.transfer = transfer;
              transfer.objects.push(object);
              dispatch('webBluetoothDFUObjectAdd', object);
              index += transfer.maxObjectLength;
            }

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function GenerateObjects(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var TransferActions = {
  webBluetoothDFUTransferAdd: function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref2, transfer) {
      var dispatch = _ref2.dispatch,
          commit = _ref2.commit;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              transfer.controlPointEventHandler = function () {
                var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(event) {
                  return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return dispatch('webBluetoothDFUTransferEventHandler', { transfer: transfer, dataView: event.target.value });

                        case 2:
                          _context2.next = 4;
                          return dispatch('webBluetoothDFUTickWrites');

                        case 4:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, this);
                }));

                return function (_x5) {
                  return _ref4.apply(this, arguments);
                };
              }();
              transfer.controlPoint.addEventListener('characteristicvaluechanged', transfer.controlPointEventHandler);
              commit(MutationTypes.ADD_TRANSFER, transfer);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function webBluetoothDFUTransferAdd(_x3, _x4) {
      return _ref3.apply(this, arguments);
    }

    return webBluetoothDFUTransferAdd;
  }(),
  webBluetoothDFUTransferRemove: function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref5, transfer) {
      var dispatch = _ref5.dispatch,
          commit = _ref5.commit;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              transfer.controlPoint.removeEventListener('characteristicvaluechanged', transfer.controlPointEventHandler);
              commit(MutationTypes.REMOVE_TRANSFER, transfer);

            case 2:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function webBluetoothDFUTransferRemove(_x6, _x7) {
      return _ref6.apply(this, arguments);
    }

    return webBluetoothDFUTransferRemove;
  }(),
  webBluetoothDFUTransferBegin: function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref7, transfer) {
      var dispatch = _ref7.dispatch,
          commit = _ref7.commit;
      var write;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              write = new _write2.default.Verify(transfer.controlPoint, transfer.objectType);
              _context5.next = 3;
              return dispatch('webBluetoothDFUScheduleWrite', write);

            case 3:
              dispatch('webBluetoothDFUExecuteWrite', write);
              commit(MutationTypes.UPDATE_TRANSFER, transfer);

            case 5:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function webBluetoothDFUTransferBegin(_x8, _x9) {
      return _ref8.apply(this, arguments);
    }

    return webBluetoothDFUTransferBegin;
  }(),
  webBluetoothDFUTransferPrepare: function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(_ref9, payload) {
      var dispatch = _ref9.dispatch,
          commit = _ref9.commit;
      var transfer, maxiumSize, currentOffset, currentCRC, object, validatePayload;
      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              console.log('webBluetoothDFUTransferPrepare');
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
              validatePayload = { checksum: currentCRC, offset: currentOffset, transferObject: transfer.objects[transfer.currentObjectIndex] };

              dispatch('webBluetoothDFUObjectValidate', validatePayload);
              commit(MutationTypes.UPDATE_TRANSFER, transfer);

            case 14:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function webBluetoothDFUTransferPrepare(_x10, _x11) {
      return _ref10.apply(this, arguments);
    }

    return webBluetoothDFUTransferPrepare;
  }(),
  webBluetoothDFUTransferNextObject: function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(_ref11, transfer) {
      var dispatch = _ref11.dispatch,
          commit = _ref11.commit;
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              console.log('webBluetoothDFUTransferNextObject');
              if (transfer.currentObjectIndex < transfer.objects.length - 1) {
                transfer.currentObjectIndex++;
                dispatch('webBluetoothDFUObjectBegin', transfer.objects[transfer.currentObjectIndex]);
              } else {
                transfer.state = _transmissionTypes2.default.Completed;
              }
              commit(MutationTypes.UPDATE_TRANSFER, transfer);

            case 3:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function webBluetoothDFUTransferNextObject(_x12, _x13) {
      return _ref12.apply(this, arguments);
    }

    return webBluetoothDFUTransferNextObject;
  }(),
  webBluetoothDFUTransferEventHandler: function () {
    var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(_ref13, payload) {
      var dispatch = _ref13.dispatch,
          commit = _ref13.commit;
      var dataView, transfer, opCode, responseCode, transferObject;
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              console.log('webBluetoothDFUTransferEventHandler');
              dataView = payload.dataView;
              transfer = payload.transfer;

              if (!(dataView.getInt8(0) !== _write2.default.Actions.RESPONSE_CODE)) {
                _context8.next = 5;
                break;
              }

              return _context8.abrupt('return');

            case 5:
              opCode = dataView.getInt8(1);
              responseCode = dataView.getInt8(2);

              if (!(opCode === _write2.default.Actions.SELECT && responseCode === _write2.default.Responses.SUCCESS && transfer.state === _transmissionTypes2.default.Prepare)) {
                _context8.next = 12;
                break;
              }

              _context8.next = 10;
              return dispatch('webBluetoothDFUTransferPrepare', { checksum: dataView.getUint32(11, true), offset: dataView.getUint32(7, true), maxiumSize: dataView.getUint32(3, true), transfer: transfer });

            case 10:
              _context8.next = 17;
              break;

            case 12:
              if (!(transfer.currentObjectIndex >= 0)) {
                _context8.next = 17;
                break;
              }

              transferObject = transfer.objects[transfer.currentObjectIndex];

              if (!transferObject) {
                _context8.next = 17;
                break;
              }

              _context8.next = 17;
              return dispatch('webBluetoothDFUObjectHandleEvent', { dataView: dataView, transferObject: transferObject });

            case 17:
              console.log('webBluetoothDFUTransferEventHandler DONE');

            case 18:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function webBluetoothDFUTransferEventHandler(_x14, _x15) {
      return _ref14.apply(this, arguments);
    }

    return webBluetoothDFUTransferEventHandler;
  }()
};

exports.default = TransferActions;
//# sourceMappingURL=transfer-actions.js.map