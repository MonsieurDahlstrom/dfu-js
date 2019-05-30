'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); // Copyright (c) 2017 Monsieur Dahlström Ltd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.


var _jszip = require('jszip');

var _jszip2 = _interopRequireDefault(_jszip);

var _Section = require('./Section');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  The different types of firmware updates a zip file can represent
    currently only Application is fully implmented
    http://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v12.2.0/ble_sdk_app_dfu_bootloader.html?cp=4_0_1_4_2_3_2#lib_dfu_image
**/
var FirmwareType = {
  Application: 0x01,
  Bootloader: 0x02,
  Softdevice: 0x04,
  SoftdeviceBootloader: 0x08,
  Invalid: 0x10,
  NotConfigured: 0x20,
  NOT_IN_USE_1: 0x40,
  NOT_IN_USE_2: 0x80

  /**
  Firmware, instances takes a zip file as input and unpacks the compressed update
  **/
};
var Firmware = function () {

  /** Create a new instance based on zip file and set inital state **/
  function Firmware(zipFile) {
    _classCallCheck(this, Firmware);

    if (zipFile == null) {
      throw new Error('Firmware zip is invalid');
    }
    this.type = FirmwareType.NotConfigured;
    this.zip = zipFile;
    this.sections = [];
  }

  /** parses the manifest and unpack the binaries **/


  _createClass(Firmware, [{
    key: 'parseManifest',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var content, json, bin, dat, section, _bin, _dat, _section, _bin2, _dat2, _section2, _bin3, _dat3, _section3;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.zip.file('manifest.json').async('string');

              case 2:
                content = _context.sent;
                json = JSON.parse(content);

                if (!json.manifest.application) {
                  _context.next = 22;
                  break;
                }

                _context.prev = 5;
                _context.next = 8;
                return this.zip.file(json.manifest.application.bin_file).async('uint8Array');

              case 8:
                bin = _context.sent;
                _context.next = 11;
                return this.zip.file(json.manifest.application.dat_file).async('uint8Array');

              case 11:
                dat = _context.sent;
                section = new _Section.Section(bin, dat, FirmwareType.Application);

                this.sections.push(section);
                this.type = FirmwareType.Application;
                _context.next = 20;
                break;

              case 17:
                _context.prev = 17;
                _context.t0 = _context['catch'](5);

                console.log(_context.t0);

              case 20:
                _context.next = 77;
                break;

              case 22:
                if (!json.manifest.bootloader) {
                  _context.next = 40;
                  break;
                }

                _context.prev = 23;
                _context.next = 26;
                return this.zip.file(json.manifest.bootloader.bin_file).async("uint8array");

              case 26:
                _bin = _context.sent;
                _context.next = 29;
                return this.zip.file(json.manifest.bootloader.dat_file).async("uint8array");

              case 29:
                _dat = _context.sent;
                _section = new _Section.Section(_bin, _dat, FirmwareType.Bootloader);

                this.sections.push(_section);
                this.type = FirmwareType.Bootloader;
                _context.next = 38;
                break;

              case 35:
                _context.prev = 35;
                _context.t1 = _context['catch'](23);

                console.log('WWFirmwareUpdate.parseManifest bootloader ' + _context.t1);

              case 38:
                _context.next = 77;
                break;

              case 40:
                if (!json.manifest.softdevice) {
                  _context.next = 58;
                  break;
                }

                _context.prev = 41;
                _context.next = 44;
                return this.zip.file(json.manifest.softdevice.bin_file).async("uint8array");

              case 44:
                _bin2 = _context.sent;
                _context.next = 47;
                return this.zip.file(json.manifest.softdevice.dat_file).async("uint8array");

              case 47:
                _dat2 = _context.sent;
                _section2 = new _Section.Section(_bin2, _dat2, FirmwareType.Application);

                this.sections.push(_section2);
                this.type = FirmwareType.Softdevice;
                _context.next = 56;
                break;

              case 53:
                _context.prev = 53;
                _context.t2 = _context['catch'](41);

                console.log('WWFirmwareUpdate.parseManifest softdevice ' + _context.t2);

              case 56:
                _context.next = 77;
                break;

              case 58:
                if (!json.manifest.softdevice_bootloader) {
                  _context.next = 76;
                  break;
                }

                _context.prev = 59;
                _context.next = 62;
                return this.zip.file(json.manifest.softdevice_bootloader.bin_file).async("uint8array");

              case 62:
                _bin3 = _context.sent;
                _context.next = 65;
                return this.zip.file(json.manifest.softdevice_bootloader.dat_file).async("uint8array");

              case 65:
                _dat3 = _context.sent;
                _section3 = new _Section.Section(_bin3, _dat3, FirmwareType.SoftdeviceBootloader);

                this.sections.push(_section3);
                this.type = FirmwareType.SoftdeviceBootloader;
                _context.next = 74;
                break;

              case 71:
                _context.prev = 71;
                _context.t3 = _context['catch'](59);

                console.log('WWFirmwareUpdate.parseManifest softdevice & bootloader ' + _context.t3);

              case 74:
                _context.next = 77;
                break;

              case 76:
                this.type = FirmwareType.Invalid;

              case 77:
                return _context.abrupt('return', this);

              case 78:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 17], [23, 35], [41, 53], [59, 71]]);
      }));

      function parseManifest() {
        return _ref.apply(this, arguments);
      }

      return parseManifest;
    }()
  }]);

  return Firmware;
}();

module.exports.Firmware = Firmware;
module.exports.FirmwareType = FirmwareType;
module.exports.FirmwareSection = _Section.Section;