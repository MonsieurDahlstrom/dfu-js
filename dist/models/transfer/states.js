"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_1euk7n9j4c = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/transfer/states.js",
      hash = "8806fb79ffb3e5a8466c2e18e960a2ad1ce6c7a0",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/transfer/states.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 23
        },
        end: {
          line: 6,
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

var TransferStates = (cov_1euk7n9j4c.s[0]++, {
  Prepare: 0x00,
  Transfer: 0x01,
  Completed: 0x02,
  Failed: 0x03
});

exports.default = TransferStates;
//# sourceMappingURL=states.js.map