'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _mutationTypes = require('./../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

var _transmissionTypes = require('./../models/transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

var _write = require('../models/write');

var _write2 = _interopRequireDefault(_write);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WriteActions = {
  webBluetoothDFUScheduleWrite: function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_ref, write) {
      var dispatch = _ref.dispatch,
          commit = _ref.commit;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (write instanceof _write2.default.Write) {
                commit(MutationTypes.ADD_WRITE, write);
              }

            case 1:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function webBluetoothDFUScheduleWrite(_x, _x2) {
      return _ref2.apply(this, arguments);
    }

    return webBluetoothDFUScheduleWrite;
  }(),
  webBluetoothDFUWriteRemove: function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(_ref3, write) {
      var dispatch = _ref3.dispatch,
          commit = _ref3.commit;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (write instanceof _write2.default.Write) {
                commit(MutationTypes.REMOVE_WRITE, write);
              }

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function webBluetoothDFUWriteRemove(_x3, _x4) {
      return _ref4.apply(this, arguments);
    }

    return webBluetoothDFUWriteRemove;
  }(),
  webBluetoothDFUExecuteWrite: function () {
    var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(_ref5, write) {
      var dispatch = _ref5.dispatch,
          commit = _ref5.commit;
      var attempts;
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              if (!(write instanceof _write2.default.Write)) {
                _context3.next = 19;
                break;
              }

              write.state = _transmissionTypes2.default.Transfering;
              commit(MutationTypes.UPDATE_WRITE, write);
              attempts = 3;

            case 4:
              _context3.prev = 4;
              _context3.next = 7;
              return write.characteristic.writeValue(write.bytes);

            case 7:
              write.error = undefined;
              write.state = _transmissionTypes2.default.Completed;
              attempts = 0;
              _context3.next = 17;
              break;

            case 12:
              _context3.prev = 12;
              _context3.t0 = _context3['catch'](4);

              attempts--;
              write.error = _context3.t0;
              write.state = _transmissionTypes2.default.Failed;

            case 17:
              if (attempts > 0) {
                _context3.next = 4;
                break;
              }

            case 18:
              commit(MutationTypes.UPDATE_WRITE, write);

            case 19:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, this, [[4, 12]]);
    }));

    function webBluetoothDFUExecuteWrite(_x5, _x6) {
      return _ref6.apply(this, arguments);
    }

    return webBluetoothDFUExecuteWrite;
  }(),
  webBluetoothDFUTickWrites: function () {
    var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(_ref7, payload) {
      var dispatch = _ref7.dispatch,
          commit = _ref7.commit,
          state = _ref7.state;
      var nextWrite;
      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              console.log('webBluetoothDFUTickWrites');
              console.log(state);
              nextWrite = state.writes.find(function (writeRecord) {
                return writeRecord.state === _transmissionTypes2.default.Transfering || writeRecord.state === _transmissionTypes2.default.Prepared;
              });

              if (nextWrite && nextWrite.state === _transmissionTypes2.default.Prepared) {
                dispatch('webBluetoothDFUExecuteWrite', nextWrite);
              }

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function webBluetoothDFUTickWrites(_x7, _x8) {
      return _ref8.apply(this, arguments);
    }

    return webBluetoothDFUTickWrites;
  }()
};

exports.default = WriteActions;
//# sourceMappingURL=write-actions.js.map