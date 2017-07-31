'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _Section = require('./Section');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FirmwareType = {
  Application: 0x01,
  Bootloader: 0x02,
  Softdevice: 0x04,
  SoftdeviceBootloader: 0x08,
  Invalid: 0x10,
  NotConfigured: 0x20,
  NOT_IN_USE_1: 0x40,
  NOT_IN_USE_2: 0x80
};

var Firmware = function () {
  function Firmware(zipFile) {
    (0, _classCallCheck3.default)(this, Firmware);

    this.type = FirmwareType.NotConfigured;
    this.zip = zipFile;
    this.sections = [];
  }

  (0, _createClass3.default)(Firmware, [{
    key: 'parseManifest',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var content, json, bin, dat, section, _bin, _dat, _section, _bin2, _dat2, _section2, _bin3, _dat3, _section3;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (this.zip) {
                  _context.next = 3;
                  break;
                }

                this.type = FirmwareType.Invalid;
                return _context.abrupt('return');

              case 3:
                _context.next = 5;
                return this.zip.file('manifest.json').async('string');

              case 5:
                content = _context.sent;
                json = JSON.parse(content);

                if (!json.manifest.application) {
                  _context.next = 25;
                  break;
                }

                _context.prev = 8;
                _context.next = 11;
                return this.zip.file(json.manifest.application.bin_file).async('uint8Array');

              case 11:
                bin = _context.sent;
                _context.next = 14;
                return this.zip.file(json.manifest.application.dat_file).async('uint8Array');

              case 14:
                dat = _context.sent;
                section = new _Section.Section(bin, dat, FirmwareType.Application);

                this.sections.push(section);
                this.type = FirmwareType.Application;
                _context.next = 23;
                break;

              case 20:
                _context.prev = 20;
                _context.t0 = _context['catch'](8);

                console.log(_context.t0);

              case 23:
                _context.next = 26;
                break;

              case 25:
                if (json.manifest.bootloader) {
                  try {
                    _bin = this.zip.file(json.manifest.bootloader.bin_file, 'uint8Array');
                    _dat = this.zip.file(json.manifest.bootloader.dat_file, 'uint8Array');
                    _section = new _Section.Section(_bin, _dat, FirmwareType.Bootloader);

                    this.sections.push(_section);
                    this.type = FirmwareType.Bootloader;
                  } catch (e) {
                    console.log('WWFirmwareUpdate.parseManifest bootloader ' + e);
                  }
                } else if (json.manifest.softdevice) {
                  try {
                    _bin2 = this.zip.file(json.manifest.softdevice.bin_file, 'uint8Array');
                    _dat2 = this.zip.file(json.manifest.softdevice.dat_file, 'uint8Array');
                    _section2 = new _Section.Section(_bin2, _dat2, FirmwareType.Application);

                    this.sections.push(_section2);
                    this.type = FirmwareType.Softdevice;
                  } catch (e) {
                    console.log('WWFirmwareUpdate.parseManifest softdevice ' + e);
                  }
                } else if (json.manifest.softdevice_bootloader) {
                  try {
                    _bin3 = this.zip.file(json.manifest.softdevice_bootloader.bin_file, 'uint8Array');
                    _dat3 = this.zip.file(json.manifest.softdevice_bootloader.dat_file, 'uint8Array');
                    _section3 = new _Section.Section(_bin3, _dat3, FirmwareType.SoftdeviceBootloader);

                    this.sections.push(_section3);
                    this.type = FirmwareType.SoftdeviceBootloader;
                  } catch (e) {
                    console.log('WWFirmwareUpdate.parseManifest softdevice & bootloader ' + e);
                  }
                } else {
                  this.type = FirmwareType.Invalid;
                }

              case 26:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 20]]);
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