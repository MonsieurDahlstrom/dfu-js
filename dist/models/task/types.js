"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var TaskTypes = {
  CREATE: 0x01,
  SET_PRN: 0x02,
  CALCULATE_CHECKSUM: 0x03,
  EXECUTE: 0x04,
  SELECT: 0x06,
  RESPONSE_CODE: 0x60
};

exports.default = TaskTypes;