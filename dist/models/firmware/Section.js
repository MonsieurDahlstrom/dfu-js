"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var cov_1d38q5l3ps = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/firmware/Section.js",
      hash = "0572318fd4f0a4ad865d034d3e519a65b812423f",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/firmware/Section.js",
    statementMap: {
      "0": {
        start: {
          line: 30,
          column: 4
        },
        end: {
          line: 30,
          column: 18
        }
      },
      "1": {
        start: {
          line: 31,
          column: 4
        },
        end: {
          line: 31,
          column: 18
        }
      },
      "2": {
        start: {
          line: 32,
          column: 4
        },
        end: {
          line: 32,
          column: 20
        }
      },
      "3": {
        start: {
          line: 37,
          column: 0
        },
        end: {
          line: 37,
          column: 32
        }
      }
    },
    fnMap: {
      "0": {
        name: "(anonymous_0)",
        decl: {
          start: {
            line: 29,
            column: 2
          },
          end: {
            line: 29,
            column: 3
          }
        },
        loc: {
          start: {
            line: 29,
            column: 31
          },
          end: {
            line: 33,
            column: 3
          }
        },
        line: 29
      }
    },
    branchMap: {},
    s: {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0
    },
    f: {
      "0": 0
    },
    b: {},
    _coverageSchema: "332fd63041d2c1bcb487cc26dd0d5f7d97098a6c"
  },
      coverage = global[gcv] || (global[gcv] = {});

  if (coverage[path] && coverage[path].hash === hash) {
    return coverage[path];
  }

  coverageData.hash = hash;
  return coverage[path] = coverageData;
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Section = function Section(bin, dat, type) {
  (0, _classCallCheck3.default)(this, Section);
  cov_1d38q5l3ps.f[0]++;
  cov_1d38q5l3ps.s[0]++;

  this.bin = bin;
  cov_1d38q5l3ps.s[1]++;
  this.dat = dat;
  cov_1d38q5l3ps.s[2]++;
  this.type = type;
};

cov_1d38q5l3ps.s[3]++;


module.exports.Section = Section;
//# sourceMappingURL=Section.js.map