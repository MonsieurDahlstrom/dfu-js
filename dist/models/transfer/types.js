"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_2otqlbqd48 = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/transfer/types.js",
      hash = "4274e6b81dbd5974039454732525bfaf8633c2df",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/transfer/types.js",
    statementMap: {
      "0": {
        start: {
          line: 6,
          column: 28
        },
        end: {
          line: 9,
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

var TransferObjectTypes = (cov_2otqlbqd48.s[0]++, {
  Command: 0x01,
  Data: 0x02
});

exports.default = TransferObjectTypes;
//# sourceMappingURL=types.js.map