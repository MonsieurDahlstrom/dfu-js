'use strict';

var cov_1k142kramr = function () {
  var path = '/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/index.js',
      hash = 'a1127bd737aba9efe03a98982abfd357c4388e7b',
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/index.js',
    statementMap: {
      '0': {
        start: {
          line: 26,
          column: 0
        },
        end: {
          line: 26,
          column: 57
        }
      },
      '1': {
        start: {
          line: 27,
          column: 0
        },
        end: {
          line: 27,
          column: 45
        }
      },
      '2': {
        start: {
          line: 29,
          column: 0
        },
        end: {
          line: 29,
          column: 34
        }
      },
      '3': {
        start: {
          line: 30,
          column: 0
        },
        end: {
          line: 30,
          column: 43
        }
      },
      '4': {
        start: {
          line: 32,
          column: 0
        },
        end: {
          line: 32,
          column: 41
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0
    },
    f: {},
    b: {},
    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
  },
      coverage = global[gcv] || (global[gcv] = {});

  if (coverage[path] && coverage[path].hash === hash) {
    return coverage[path];
  }

  coverageData.hash = hash;
  return coverage[path] = coverageData;
}();

var _stateMachine = require('./models/state-machine');

var _firmware = require('./models/firmware');

var _webBluetoothDfu = require('./vue-mixins/web-bluetooth-dfu.js');

var _webBluetoothDfu2 = _interopRequireDefault(_webBluetoothDfu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

cov_1k142kramr.s[0]++;

module.exports.StateMachineStates = _stateMachine.DFUStateMachineStates;
cov_1k142kramr.s[1]++;
module.exports.StateMachine = _stateMachine.DFUStateMachine;
cov_1k142kramr.s[2]++;

module.exports.Firmware = _firmware.Firmware;
cov_1k142kramr.s[3]++;
module.exports.FirmwareTypes = _firmware.FirmwareType;
cov_1k142kramr.s[4]++;

module.exports.DFUMixin = _webBluetoothDfu2.default;
//# sourceMappingURL=index.js.map