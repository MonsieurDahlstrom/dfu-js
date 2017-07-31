"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Section = function Section(bin, dat, type) {
  (0, _classCallCheck3.default)(this, Section);

  this.bin = bin;
  this.dat = dat;
  this.type = type;
};

module.exports.Section = Section;