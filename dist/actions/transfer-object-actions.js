'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _crc = require('crc');

var _crc2 = _interopRequireDefault(_crc);

var _write2 = require('../models/write');

var _write3 = _interopRequireDefault(_write2);

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

var _transferObject = require('../models/transfer-object');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DATA_CHUNK_SIZE = 20;

var TransferObjectActions = {
  webBluetoothDFUObjectAdd: function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref, transferObject) {
      var dispatch = _ref.dispatch,
          commit = _ref.commit;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              commit(MutationTypes.ADD_TRANSFER_OBJECT, transferObject);

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function webBluetoothDFUObjectAdd(_x, _x2) {
      return _ref2.apply(this, arguments);
    }

    return webBluetoothDFUObjectAdd;
  }(),
  webBluetoothDFUObjectRemove: function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(_ref3, transferObject) {
      var dispatch = _ref3.dispatch,
          commit = _ref3.commit;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              commit(MutationTypes.REMOVE_TRANSFER_OBJECT, transferObject);

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function webBluetoothDFUObjectRemove(_x3, _x4) {
      return _ref4.apply(this, arguments);
    }

    return webBluetoothDFUObjectRemove;
  }(),
  webBluetoothDFUObjectBegin: function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref5, transferObject) {
      var dispatch = _ref5.dispatch,
          commit = _ref5.commit;
      var write;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              transferObject.state = _transferObject.TransferObjectState.Creating;
              write = new _write3.default.Verify(transferObject.type, transferObject.transfer.controlPoint);

              write.transferObject = transferObject;
              dispatch('webBluetoothDFUScheduleWrite', write);
              dispatch('webBluetoothDFUExecuteWrite', write);
              commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject);

            case 6:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function webBluetoothDFUObjectBegin(_x5, _x6) {
      return _ref6.apply(this, arguments);
    }

    return webBluetoothDFUObjectBegin;
  }(),
  webBluetoothDFUObjectToPackets: function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref7, payload) {
      var dispatch = _ref7.dispatch,
          commit = _ref7.commit;
      var transferObject, offset, parentFileEnd, parentFileBegin, index, chunkBegin, chunkEnd, chunk;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log('  webBluetoothDFUObjectToPackets');
              console.log(payload);
              transferObject = payload.transferObject;
              offset = payload.offset;
              parentFileEnd = transferObject.offset + transferObject.length;
              parentFileBegin = transferObject.offset + offset;
              index = parentFileBegin;

              while (index < parentFileEnd) {
                chunkBegin = index;
                chunkEnd = chunkBegin + DATA_CHUNK_SIZE < parentFileEnd ? chunkBegin + DATA_CHUNK_SIZE : chunkBegin + (parentFileEnd - index);
                chunk = transferObject.transfer.file.slice(chunkBegin, chunkEnd);

                transferObject.chunks.push(chunk);
                index += DATA_CHUNK_SIZE;
              }
              commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject);

            case 9:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function webBluetoothDFUObjectToPackets(_x7, _x8) {
      return _ref8.apply(this, arguments);
    }

    return webBluetoothDFUObjectToPackets;
  }(),
  webBluetoothDFUObjectTransferDataPackages: function () {
    var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(_ref9, transferObject) {
      var dispatch = _ref9.dispatch,
          commit = _ref9.commit;
      var index, buffer, write;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              console.log('  webBluetoothDFUObjectTransferDataPackages');
              index = 0;

            case 2:
              if (!(index < transferObject.chunks.length)) {
                _context5.next = 13;
                break;
              }

              buffer = transferObject.chunks[index];
              write = new _write3.default.Package(transferObject.transfer.packetPoint, buffer);

              write.transferObject = transferObject;
              _context5.next = 8;
              return dispatch('webBluetoothDFUScheduleWrite', write);

            case 8:
              _context5.next = 10;
              return dispatch('webBluetoothDFUExecuteWrite', write);

            case 10:
              index++;
              _context5.next = 2;
              break;

            case 13:
              commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject);

            case 14:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function webBluetoothDFUObjectTransferDataPackages(_x9, _x10) {
      return _ref10.apply(this, arguments);
    }

    return webBluetoothDFUObjectTransferDataPackages;
  }(),
  webBluetoothDFUObjectValidate: function () {
    var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(_ref11, payload) {
      var dispatch = _ref11.dispatch,
          commit = _ref11.commit;

      var transferObject, offset, checksum, fileCRCToOffset, write, _write;

      return _regenerator2.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              console.log('  webBluetoothDFUObjectValidate');
              transferObject = payload.transferObject;
              offset = payload.offset;
              checksum = payload.checksum;
              fileCRCToOffset = _crc2.default.crc32(transferObject.transfer.file.slice(0, offset));

              if (offset === transferObject.offset + transferObject.length && checksum === fileCRCToOffset) {
                console.log('    Transfer complete');

                transferObject.state = _transferObject.TransferObjectState.Storing;
                write = new _write3.default.Execute(transferObject.transfer.packetPoint);

                write.transferObject = transferObject;
                dispatch('webBluetoothDFUScheduleWrite', write);
              } else if (offset === transferObject.offset || offset > transferObject.offset + transferObject.length || checksum !== fileCRCToOffset) {
                console.log('    Transfer needs to be created');

                transferObject.state = _transferObject.TransferObjectState.Creating;
                _write = new _write3.default.Create(transferObject.transfer.controlPoint, transferObject.type, transferObject.length);

                _write.transferObject = transferObject;
                dispatch('webBluetoothDFUScheduleWrite', _write);
              } else {
                console.log('    Initiate package transfer');

                transferObject.state = _transferObject.TransferObjectState.Transfering;
                dispatch('webBluetoothDFUObjectToPackets', { transferObject: transferObject, offset: offset });
                dispatch('webBluetoothDFUObjectSetPacketReturnNotification', transferObject);
                dispatch('webBluetoothDFUObjectTransferDataPackages', transferObject);
              }
              commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject);

            case 7:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function webBluetoothDFUObjectValidate(_x11, _x12) {
      return _ref12.apply(this, arguments);
    }

    return webBluetoothDFUObjectValidate;
  }(),
  webBluetoothDFUObjectSetPacketReturnNotification: function () {
    var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(_ref13, transferObject) {
      var dispatch = _ref13.dispatch,
          commit = _ref13.commit;
      var write;
      return _regenerator2.default.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              console.log('  webBluetoothDFUObjectSetPacketReturnNotification');
              write = new _write3.default.PacketReturnNotification(transferObject.transfer.packetPoint, transferObject.chunks.length);

              write.transferObject = transferObject;
              dispatch('webBluetoothDFUScheduleWrite', write);
              commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject);

            case 5:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, this);
    }));

    function webBluetoothDFUObjectSetPacketReturnNotification(_x13, _x14) {
      return _ref14.apply(this, arguments);
    }

    return webBluetoothDFUObjectSetPacketReturnNotification;
  }(),
  webBluetoothDFUObjectHandleEvent: function () {
    var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(_ref15, payload) {
      var dispatch = _ref15.dispatch,
          commit = _ref15.commit;
      var dataView, transferObject;
      return _regenerator2.default.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              console.log('  webBluetoothDFUObjectHandleEvent');
              dataView = payload.dataView;
              transferObject = payload.transferObject;

              payload.opCode = dataView.getInt8(1);
              payload.responseCode = dataView.getInt8(2);
              _context8.t0 = transferObject.state;
              _context8.next = _context8.t0 === _transferObject.TransferObjectState.Creating ? 8 : _context8.t0 === _transferObject.TransferObjectState.Transfering ? 10 : _context8.t0 === _transferObject.TransferObjectState.Storing ? 12 : 14;
              break;

            case 8:
              dispatch('webBluetoothDFUObjectHandleEventWhileCreating', payload);
              return _context8.abrupt('break', 14);

            case 10:
              dispatch('webBluetoothDFUObjectHandleEventWhileTransfering', payload);
              return _context8.abrupt('break', 14);

            case 12:
              dispatch('webBluetoothDFUObjectHandleEventWhileStoring', payload);
              return _context8.abrupt('break', 14);

            case 14:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, this);
    }));

    function webBluetoothDFUObjectHandleEvent(_x15, _x16) {
      return _ref16.apply(this, arguments);
    }

    return webBluetoothDFUObjectHandleEvent;
  }(),
  webBluetoothDFUObjectHandleEventWhileCreating: function () {
    var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(_ref17, payload) {
      var dispatch = _ref17.dispatch,
          commit = _ref17.commit;
      return _regenerator2.default.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              console.log('  webBluetoothDFUObjectHandleEventWhileCreating');
              if (payload.opCode === _write3.default.Actions.SELECT && payload.responseCode === _write3.default.Responses.SUCCESS) {
                console.log('    SELECT SUCCESS');

                payload.offset = payload.dataView.getUint32(7, true);
                payload.checksum = payload.dataView.getUint32(11, true);
                dispatch('webBluetoothDFUObjectValidate', payload);
                commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject);
              } else if (payload.opCode === _write3.default.Actions.CREATE && payload.responseCode === _write3.default.Responses.SUCCESS) {
                console.log('    CREATE SUCCESS');
                payload.transferObject.state = _transferObject.TransferObjectState.Transfering;

                payload.offset = 0;
                dispatch('webBluetoothDFUObjectToPackets', payload);
                dispatch('webBluetoothDFUObjectSetPacketReturnNotification', payload.transferObject);
                dispatch('webBluetoothDFUObjectTransferDataPackages', payload.transferObject);
                commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject);
              } else if (payload.opCode === _write3.default.Actions.SET_PRN && payload.responseCode === _write3.default.Responses.SUCCESS) {
                console.log('    PRN SUCCESS');
              } else {
                console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode);
              }

            case 2:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, this);
    }));

    function webBluetoothDFUObjectHandleEventWhileCreating(_x17, _x18) {
      return _ref18.apply(this, arguments);
    }

    return webBluetoothDFUObjectHandleEventWhileCreating;
  }(),
  webBluetoothDFUObjectHandleEventWhileTransfering: function () {
    var _ref20 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(_ref19, payload) {
      var dispatch = _ref19.dispatch,
          commit = _ref19.commit;
      return _regenerator2.default.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              console.log('webBluetoothDFUObjectHandleEventWhileTransfering');
              if (payload.opCode === _write3.default.Actions.CALCULATE_CHECKSUM && payload.responseCode === _write3.default.Responses.SUCCESS) {
                payload.offset = payload.dataView.getUint32(7, true);
                payload.checksum = payload.dataView.getUint32(11, true);
                dispatch('webBluetoothDFUObjectValidate', payload);
                commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject);
              } else if (payload.opCode === _write3.default.Actions.SET_PRN && payload.responseCode === _write3.default.Responses.SUCCESS) {} else {
                console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode);
              }

            case 2:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, this);
    }));

    function webBluetoothDFUObjectHandleEventWhileTransfering(_x19, _x20) {
      return _ref20.apply(this, arguments);
    }

    return webBluetoothDFUObjectHandleEventWhileTransfering;
  }(),
  webBluetoothDFUObjectHandleEventWhileStoring: function () {
    var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(_ref21, payload) {
      var dispatch = _ref21.dispatch,
          commit = _ref21.commit;
      return _regenerator2.default.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              console.log('webBluetoothDFUObjectHandleEventWhileStoring');
              if (payload.opCode === _write3.default.Actions.EXECUTE && payload.responseCode === _write3.default.Responses.SUCCESS) {
                payload.transferObject.state = _transferObject.TransferObjectState.Completed;
                commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject);
              } else if (payload.opCode === _write3.default.Actions.SET_PRN && payload.responseCode === _write3.default.Responses.SUCCESS) {} else {
                console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode);
              }

            case 2:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, this);
    }));

    function webBluetoothDFUObjectHandleEventWhileStoring(_x21, _x22) {
      return _ref22.apply(this, arguments);
    }

    return webBluetoothDFUObjectHandleEventWhileStoring;
  }()
};

exports.default = TransferObjectActions;
//# sourceMappingURL=transfer-object-actions.js.map