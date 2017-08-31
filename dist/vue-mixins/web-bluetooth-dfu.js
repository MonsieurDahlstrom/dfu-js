'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _firmware = require('../models/firmware');

var _stateMachine = require('../models/state-machine');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WebBluetoothDFU = {
  data: function data() {
    return { dfuFirmware: undefined, dfuStateMachine: new _stateMachine.DFUStateMachine(), dfuState: _stateMachine.DFUStateMachineStates.NOT_CONFIGURED, dfuProgress: 0.0 };
  },
  beforeMount: function beforeMount() {
    this.dfuStateMachine.on('progressChanged', this.updateDFUProgress);
    this.dfuStateMachine.on('stateChanged', this.updateDFUState);

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
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(zip) {
        return _regenerator2.default.wrap(function _callee$(_context) {
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
      this.dfuProgress = payload.progress;
    }
  }
};

exports.default = WebBluetoothDFU;
//# sourceMappingURL=web-bluetooth-dfu.js.map