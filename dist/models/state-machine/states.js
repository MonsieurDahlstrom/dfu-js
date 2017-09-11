"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_jor1jv8iz = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/state-machine/states.js",
      hash = "6c652f12f0ec514a047852b49d00954cca52abb6",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/state-machine/states.js",
    statementMap: {
      "0": {
        start: {
          line: 9,
          column: 27
        },
        end: {
          line: 15,
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

var StateMachineStates = (cov_jor1jv8iz.s[0]++, {
  NOT_CONFIGURED: 0x00,
  IDLE: 0x01,
  TRANSFERING: 0x02,
  COMPLETE: 0x03,
  FAILED: 0x04
});

exports.default = StateMachineStates;
//# sourceMappingURL=states.js.map