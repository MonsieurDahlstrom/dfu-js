"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WWFirmwareSection =

/**
  Secure DFU update section contains a bin and dat file
    bin is the binary image to transfer
    dat is the init package to send before transfering the bin
*/
function WWFirmwareSection(bin, dat, type) {
  (0, _classCallCheck3.default)(this, WWFirmwareSection);

  this.bin = bin;
  this.dat = dat;
  this.type = type;
};

module.exports.WWFirmwareSection = WWFirmwareSection;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maXJtd2FyZS9TZWN0aW9uLmpzIl0sIm5hbWVzIjpbIldXRmlybXdhcmVTZWN0aW9uIiwiYmluIiwiZGF0IiwidHlwZSIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQU1BLGlCOztBQUVKOzs7OztBQUtBLDJCQUFhQyxHQUFiLEVBQWtCQyxHQUFsQixFQUF1QkMsSUFBdkIsRUFBNkI7QUFBQTs7QUFDM0IsT0FBS0YsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsT0FBS0MsR0FBTCxHQUFXQSxHQUFYO0FBQ0EsT0FBS0MsSUFBTCxHQUFZQSxJQUFaO0FBQ0QsQzs7QUFJSEMsT0FBT0MsT0FBUCxDQUFlTCxpQkFBZixHQUFtQ0EsaUJBQW5DIiwiZmlsZSI6IlNlY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBXV0Zpcm13YXJlU2VjdGlvbiB7XHJcblxyXG4gIC8qKlxyXG4gICAgU2VjdXJlIERGVSB1cGRhdGUgc2VjdGlvbiBjb250YWlucyBhIGJpbiBhbmQgZGF0IGZpbGVcclxuICAgICAgYmluIGlzIHRoZSBiaW5hcnkgaW1hZ2UgdG8gdHJhbnNmZXJcclxuICAgICAgZGF0IGlzIHRoZSBpbml0IHBhY2thZ2UgdG8gc2VuZCBiZWZvcmUgdHJhbnNmZXJpbmcgdGhlIGJpblxyXG4gICovXHJcbiAgY29uc3RydWN0b3IgKGJpbiwgZGF0LCB0eXBlKSB7XHJcbiAgICB0aGlzLmJpbiA9IGJpblxyXG4gICAgdGhpcy5kYXQgPSBkYXRcclxuICAgIHRoaXMudHlwZSA9IHR5cGVcclxuICB9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cy5XV0Zpcm13YXJlU2VjdGlvbiA9IFdXRmlybXdhcmVTZWN0aW9uXHJcbiJdfQ==