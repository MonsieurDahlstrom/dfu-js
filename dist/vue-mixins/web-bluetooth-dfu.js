'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _firmware = require('../models/firmware');

var _stateMachine = require('../models/state-machine');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var WebBluetoothDFU = {
  data: function data() {
    return { dfuFirmware: undefined, dfuStateMachine: new _stateMachine.DFUStateMachine(), dfuState: _stateMachine.DFUStateMachineStates.NOT_CONFIGURED, dfuProgress: 0.0 };
  },
  created: function created() {
    this.dfuStateMachine.on('progressChanged', this.updateDFUProgress);
    this.dfuStateMachine.on('stateChanged', this.updateDFUState);
    // `this` points to the vm instance
    this.dfuStateMachine.controlPoint = this.webBluetoothControlPoint;
    this.dfuStateMachine.packetPoint = this.webBluetoothPacketPoint;
  },
  computed: {
    webBluetoothControlPoint: function webBluetoothControlPoint() {
      throw new Error('DFUMixin expects component to provide computed property webBluetoothControlPoint');
    },
    webBluetoothPacketPoint: function webBluetoothPacketPoint() {
      throw new Error('DFUMixin expects component to provide computed property webBluetoothPacketPoint');
    },
    dfuIdle: function dfuIdle() {
      return this.dfuState === _stateMachine.DFUStateMachineStates.IDLE;
    },
    dfuInProgress: function dfuInProgress() {
      return this.dfuState === _stateMachine.DFUStateMachineStates.TRANSFERING;
    },
    dfuCompleted: function dfuCompleted() {
      return this.dfuState === _stateMachine.DFUStateMachineStates.COMPLETE || this.dfuState === _stateMachine.DFUStateMachineStates.FAILED;
    }
  },
  methods: {
    firmwareFromZip: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(zip) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.dfuFirmware = new _firmware.Firmware(zip);
                _context.next = 3;
                return this.dfuFirmware.parseManifest();

              case 3:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function firmwareFromZip(_x) {
        return _ref.apply(this, arguments);
      }

      return firmwareFromZip;
    }(),
    resetDFU: function resetDFU() {
      this.dfuStateMachine.reset();
    },
    performDFU: function performDFU() {
      this.dfuStateMachine.sendFirmware(this.dfuFirmware);
    },
    updateDFUState: function updateDFUState(payload) {
      this.dfuState = payload.state;
    },
    updateDFUProgress: function updateDFUProgress(payload) {
      var num = new Number(this.dfuStateMachine.progress.completed / this.dfuStateMachine.progress.size);
      this.dfuProgress = num.toFixed(2);
    }
  }
};

exports.default = WebBluetoothDFU;