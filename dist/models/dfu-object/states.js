"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_1pku6rh9xe = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/dfu-object/states.js",
      hash = "ef30df6dfe241fa38acc79f39c000fd14702d34d",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/dfu-object/states.js",
    statementMap: {
      "0": {
        start: {
          line: 2,
          column: 24
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

var DFUObjectStates = (cov_1pku6rh9xe.s[0]++, {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
});

exports.default = DFUObjectStates;
//# sourceMappingURL=states.js.map