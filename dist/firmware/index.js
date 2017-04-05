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
  SoftdeviceBootloader: 0x08
};

var Firmware = function () {
  function Firmware(zipFile) {
    (0, _classCallCheck3.default)(this, Firmware);

    this.zip = zipFile;
    this.sections = [];
  }

  (0, _createClass3.default)(Firmware, [{
    key: 'parseManifest',
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
        var content, json, bin, dat, section, _bin, _dat, _section, _bin2, _dat2, _section2;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.zip.file('manifest.json').async('string');

              case 2:
                content = _context.sent;
                json = JSON.parse(content);

                if (!json.manifest.application) {
                  _context.next = 19;
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
                section = new WWFirmwareSection(bin, dat, FirmwareType.application);

                this.sections.push(section);
                _context.next = 19;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context['catch'](5);

                console.log(_context.t0);

              case 19:
                if (json.manifest.bootloader) {
                  try {
                    _bin = this.zip.file(json.manifest.bootloader.bin_file, 'uint8Array');
                    _dat = this.zip.file(json.manifest.bootloader.dat_file, 'uint8Array');
                    _section = new WWFirmwareSection(_bin, _dat, FirmwareType.application);

                    this.sections.push(_section);
                  } catch (e) {
                    console.log('WWFirmwareUpdate.parseManifest bootloader ' + e);
                  }
                }
                if (json.manifest.softdevice) {
                  try {
                    _bin2 = this.zip.file(json.manifest.softdevice.bin_file, 'uint8Array');
                    _dat2 = this.zip.file(json.manifest.softdevice.dat_file, 'uint8Array');
                    _section2 = new WWFirmwareSection(_bin2, _dat2, FirmwareType.application);

                    this.sections.push(_section2);
                  } catch (e) {
                    console.log('WWFirmwareUpdate.parseManifest softdevice ' + e);
                  }
                }

                if (json.manifest.softdevice_bootloader) {
                  // TODO: Implmentation needed to handle the dual sizes of both sd and bl.
                  /**
                  try {
                    let bin = this.zip.file(json.manifest.softdevice.bin_file, 'uint8Array')
                    let dat = this.zip.file(json.manifest.softdevice.dat_file, 'uint8Array')
                    this.sections.push(new WWFirmwareUpdateSection(bin, dat, FirmwareType.SoftdeviceBootloader))
                  } catch (e) {
                    console.log('WWFirmwareUpdate.parseManifest softdevice ' + e)
                  }
                  */
                }

              case 22:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 16]]);
      }));

      function parseManifest() {
        return _ref.apply(this, arguments);
      }

      return parseManifest;
    }()
  }, {
    key: 'firmwareType',
    value: function firmwareType() {
      return this.sections.reduce(0, function (sum, item) {
        sum = sum | item.type;
        return sum;
      });
    }
  }, {
    key: 'ready',
    value: function ready() {
      return this.sections.reduce(true, function (sum, item) {
        if (!item.ready) sum = false;
        return sum;
      });
    }
  }]);
  return Firmware;
}();

var _exports = module.exports = {};
_exports.Firmware = Firmware;
_exports.FirmwareType = FirmwareType;
_exports.FirmwareSection = _Section.Section;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9maXJtd2FyZS9pbmRleC5qcyJdLCJuYW1lcyI6WyJGaXJtd2FyZVR5cGUiLCJBcHBsaWNhdGlvbiIsIkJvb3Rsb2FkZXIiLCJTb2Z0ZGV2aWNlIiwiU29mdGRldmljZUJvb3Rsb2FkZXIiLCJGaXJtd2FyZSIsInppcEZpbGUiLCJ6aXAiLCJzZWN0aW9ucyIsImZpbGUiLCJhc3luYyIsImNvbnRlbnQiLCJqc29uIiwiSlNPTiIsInBhcnNlIiwibWFuaWZlc3QiLCJhcHBsaWNhdGlvbiIsImJpbl9maWxlIiwiYmluIiwiZGF0X2ZpbGUiLCJkYXQiLCJzZWN0aW9uIiwiV1dGaXJtd2FyZVNlY3Rpb24iLCJwdXNoIiwiY29uc29sZSIsImxvZyIsImJvb3Rsb2FkZXIiLCJlIiwic29mdGRldmljZSIsInNvZnRkZXZpY2VfYm9vdGxvYWRlciIsInJlZHVjZSIsInN1bSIsIml0ZW0iLCJ0eXBlIiwicmVhZHkiLCJleHBvcnRzIiwibW9kdWxlIiwiRmlybXdhcmVTZWN0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBLElBQU1BLGVBQWU7QUFDbkJDLGVBQWEsSUFETTtBQUVuQkMsY0FBWSxJQUZPO0FBR25CQyxjQUFZLElBSE87QUFJbkJDLHdCQUFzQjtBQUpILENBQXJCOztJQU9NQyxRO0FBRUosb0JBQWFDLE9BQWIsRUFBc0I7QUFBQTs7QUFDcEIsU0FBS0MsR0FBTCxHQUFXRCxPQUFYO0FBQ0EsU0FBS0UsUUFBTCxHQUFnQixFQUFoQjtBQUNEOzs7Ozs7Ozs7Ozs7O3VCQUdxQixLQUFLRCxHQUFMLENBQVNFLElBQVQsQ0FBYyxlQUFkLEVBQStCQyxLQUEvQixDQUFxQyxRQUFyQyxDOzs7QUFBaEJDLHVCO0FBQ0FDLG9CLEdBQU9DLEtBQUtDLEtBQUwsQ0FBV0gsT0FBWCxDOztxQkFDUEMsS0FBS0csUUFBTCxDQUFjQyxXOzs7Ozs7O3VCQUVFLEtBQUtULEdBQUwsQ0FBU0UsSUFBVCxDQUFjRyxLQUFLRyxR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IGZyb20gJy4vU2VjdGlvbidcclxuXHJcbmNvbnN0IEZpcm13YXJlVHlwZSA9IHtcclxuICBBcHBsaWNhdGlvbjogMHgwMSxcclxuICBCb290bG9hZGVyOiAweDAyLFxyXG4gIFNvZnRkZXZpY2U6IDB4MDQsXHJcbiAgU29mdGRldmljZUJvb3Rsb2FkZXI6IDB4MDhcclxufVxyXG5cclxuY2xhc3MgRmlybXdhcmUge1xyXG5cclxuICBjb25zdHJ1Y3RvciAoemlwRmlsZSkge1xyXG4gICAgdGhpcy56aXAgPSB6aXBGaWxlXHJcbiAgICB0aGlzLnNlY3Rpb25zID0gW11cclxuICB9XHJcblxyXG4gIGFzeW5jIHBhcnNlTWFuaWZlc3QgKCkge1xyXG4gICAgbGV0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLnppcC5maWxlKCdtYW5pZmVzdC5qc29uJykuYXN5bmMoJ3N0cmluZycpXHJcbiAgICBsZXQganNvbiA9IEpTT04ucGFyc2UoY29udGVudClcclxuICAgIGlmIChqc29uLm1hbmlmZXN0LmFwcGxpY2F0aW9uKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGJpbiA9IGF3YWl0IHRoaXMuemlwLmZpbGUoanNvbi5tYW5pZmVzdC5hcHBsaWNhdGlvbi5iaW5fZmlsZSkuYXN5bmMoJ3VpbnQ4QXJyYXknKVxyXG4gICAgICAgIGxldCBkYXQgPSBhd2FpdCB0aGlzLnppcC5maWxlKGpzb24ubWFuaWZlc3QuYXBwbGljYXRpb24uZGF0X2ZpbGUpLmFzeW5jKCd1aW50OEFycmF5JylcclxuICAgICAgICBsZXQgc2VjdGlvbiA9IG5ldyBXV0Zpcm13YXJlU2VjdGlvbihiaW4sIGRhdCwgRmlybXdhcmVUeXBlLmFwcGxpY2F0aW9uKVxyXG4gICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaChzZWN0aW9uKVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGpzb24ubWFuaWZlc3QuYm9vdGxvYWRlcikge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBiaW4gPSB0aGlzLnppcC5maWxlKGpzb24ubWFuaWZlc3QuYm9vdGxvYWRlci5iaW5fZmlsZSwgJ3VpbnQ4QXJyYXknKVxyXG4gICAgICAgIGxldCBkYXQgPSB0aGlzLnppcC5maWxlKGpzb24ubWFuaWZlc3QuYm9vdGxvYWRlci5kYXRfZmlsZSwgJ3VpbnQ4QXJyYXknKVxyXG4gICAgICAgIGxldCBzZWN0aW9uID0gbmV3IFdXRmlybXdhcmVTZWN0aW9uKGJpbiwgZGF0LCBGaXJtd2FyZVR5cGUuYXBwbGljYXRpb24pXHJcbiAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKHNlY3Rpb24pXHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnV1dGaXJtd2FyZVVwZGF0ZS5wYXJzZU1hbmlmZXN0IGJvb3Rsb2FkZXIgJyArIGUpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChqc29uLm1hbmlmZXN0LnNvZnRkZXZpY2UpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBsZXQgYmluID0gdGhpcy56aXAuZmlsZShqc29uLm1hbmlmZXN0LnNvZnRkZXZpY2UuYmluX2ZpbGUsICd1aW50OEFycmF5JylcclxuICAgICAgICBsZXQgZGF0ID0gdGhpcy56aXAuZmlsZShqc29uLm1hbmlmZXN0LnNvZnRkZXZpY2UuZGF0X2ZpbGUsICd1aW50OEFycmF5JylcclxuICAgICAgICBsZXQgc2VjdGlvbiA9IG5ldyBXV0Zpcm13YXJlU2VjdGlvbihiaW4sIGRhdCwgRmlybXdhcmVUeXBlLmFwcGxpY2F0aW9uKVxyXG4gICAgICAgIHRoaXMuc2VjdGlvbnMucHVzaChzZWN0aW9uKVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ1dXRmlybXdhcmVVcGRhdGUucGFyc2VNYW5pZmVzdCBzb2Z0ZGV2aWNlICcgKyBlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGpzb24ubWFuaWZlc3Quc29mdGRldmljZV9ib290bG9hZGVyKSB7XHJcbiAgICAgIC8vIFRPRE86IEltcGxtZW50YXRpb24gbmVlZGVkIHRvIGhhbmRsZSB0aGUgZHVhbCBzaXplcyBvZiBib3RoIHNkIGFuZCBibC5cclxuICAgICAgLyoqXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGJpbiA9IHRoaXMuemlwLmZpbGUoanNvbi5tYW5pZmVzdC5zb2Z0ZGV2aWNlLmJpbl9maWxlLCAndWludDhBcnJheScpXHJcbiAgICAgICAgbGV0IGRhdCA9IHRoaXMuemlwLmZpbGUoanNvbi5tYW5pZmVzdC5zb2Z0ZGV2aWNlLmRhdF9maWxlLCAndWludDhBcnJheScpXHJcbiAgICAgICAgdGhpcy5zZWN0aW9ucy5wdXNoKG5ldyBXV0Zpcm13YXJlVXBkYXRlU2VjdGlvbihiaW4sIGRhdCwgRmlybXdhcmVUeXBlLlNvZnRkZXZpY2VCb290bG9hZGVyKSlcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdXV0Zpcm13YXJlVXBkYXRlLnBhcnNlTWFuaWZlc3Qgc29mdGRldmljZSAnICsgZSlcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZmlybXdhcmVUeXBlICgpIHtcclxuICAgIHJldHVybiB0aGlzLnNlY3Rpb25zLnJlZHVjZSgwLCAoc3VtLCBpdGVtKSA9PiB7XHJcbiAgICAgIHN1bSA9IHN1bSB8IGl0ZW0udHlwZVxyXG4gICAgICByZXR1cm4gc3VtXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcmVhZHkgKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuc2VjdGlvbnMucmVkdWNlKHRydWUsIChzdW0sIGl0ZW0pID0+IHtcclxuICAgICAgaWYgKCFpdGVtLnJlYWR5KSBzdW0gPSBmYWxzZVxyXG4gICAgICByZXR1cm4gc3VtXHJcbiAgICB9KVxyXG4gIH1cclxufVxyXG5cclxudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xyXG5leHBvcnRzLkZpcm13YXJlID0gRmlybXdhcmVcclxuZXhwb3J0cy5GaXJtd2FyZVR5cGUgPSBGaXJtd2FyZVR5cGVcclxuZXhwb3J0cy5GaXJtd2FyZVNlY3Rpb24gPSBTZWN0aW9uXHJcbiJdfQ==