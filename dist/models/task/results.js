"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_2o6zjghih0 = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/task/results.js",
      hash = "dc1df41b27e82f2ce7c1e6fb6304a6055b6c0f31",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/task/results.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 20
        },
        end: {
          line: 11,
          column: 1
        }
      }
    },
    fnMap: {},
    branchMap: {},
    s: {
      "0": 0
    },
    f: {},
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

var TaskResults = (cov_2o6zjghih0.s[0]++, {
  INVALID_CODE: 0x00,
  SUCCESS: 0x01,
  OPCODE_NOT_SUPPORTED: 0x02,
  INVALID_PARAMETER: 0x03,
  INSUFFICIENT_RESOURCES: 0x04,
  INVALID_OBJECT: 0x05,
  UNSUPPORTED_TYPE: 0x07,
  OPERATION_NOT_PERMITTED: 0x08,
  OPERATION_FAILED: 0x0A
});
exports.default = TaskResults;
//# sourceMappingURL=results.js.map