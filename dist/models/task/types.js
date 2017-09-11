"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var cov_285kllrcv6 = function () {
  var path = "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/task/types.js",
      hash = "fc149ca18ebfd569d20cd7fa559cba8197da9dcd",
      global = new Function('return this')(),
      gcv = "__coverage__",
      coverageData = {
    path: "/Users/mdahlstrom/Documents/GitHub/web-bluetooth-dfu/src/models/task/types.js",
    statementMap: {
      "0": {
        start: {
          line: 1,
          column: 18
        },
        end: {
          line: 8,
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

var TaskTypes = (cov_285kllrcv6.s[0]++, {
  CREATE: 0x01,
  SET_PRN: 0x02,
  CALCULATE_CHECKSUM: 0x03,
  EXECUTE: 0x04,
  SELECT: 0x06,
  RESPONSE_CODE: 0x60
});

exports.default = TaskTypes;
//# sourceMappingURL=types.js.map