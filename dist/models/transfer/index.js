'use strict';

var cov_18r6xoo5zo = function () {
  var path = '/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/transfer/index.js',
      hash = '4ec236bd910fe7ef1ef5263b188a676ccac1966e',
      global = new Function('return this')(),
      gcv = '__coverage__',
      coverageData = {
    path: '/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/transfer/index.js',
    statementMap: {
      '0': {
        start: {
          line: 27,
          column: 0
        },
        end: {
          line: 27,
          column: 34
        }
      },
      '1': {
        start: {
          line: 28,
          column: 0
        },
        end: {
          line: 28,
          column: 46
        }
      },
      '2': {
        start: {
          line: 29,
          column: 0
        },
        end: {
          line: 29,
          column: 44
        }
      },
      '3': {
        start: {
          line: 30,
          column: 0
        },
        end: {
          line: 30,
          column: 46
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0
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

var _transferWorker = require('./transfer-worker');

var _transferWorker2 = _interopRequireDefault(_transferWorker);

var _states = require('./states');

var _states2 = _interopRequireDefault(_states);

var _types = require('./types');

var _types2 = _interopRequireDefault(_types);

var _transfer = require('./transfer');

var _transfer2 = _interopRequireDefault(_transfer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

cov_18r6xoo5zo.s[0]++;


module.exports.Transfer = _transfer2.default;
cov_18r6xoo5zo.s[1]++;
module.exports.TransferStates = _states2.default;
cov_18r6xoo5zo.s[2]++;
module.exports.TransferTypes = _types2.default;
cov_18r6xoo5zo.s[3]++;
module.exports.TransferWorker = _transferWorker2.default;
//# sourceMappingURL=index.js.map