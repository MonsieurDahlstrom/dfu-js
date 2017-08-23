import {expect} from 'chai'
import {Firmware,FirmwareType} from '../../../../src/models/firmware'
import JSZip from 'jszip'

const SharedDFUParseZip = function (context, testZipPath, expectedType, numberOfSections) {
  beforeEach(function (done) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", function() {
      JSZip.loadAsync(oReq.response)
      .then(function(zip) {
        context.firmware = new Firmware(zip)
        done()
      })
      .catch(err => {
        done(err)
      })
    })
    oReq.open('GET',testZipPath)
    oReq.responseType = "arraybuffer";
    oReq.send();
  })

  afterEach(function () {
    context.firmware = undefined
  })
  it('parse zip', function (done) {
    context.firmware.parseManifest()
    .then(function () {
      expect(context.firmware.type).to.equal(expectedType);
      expect(context.firmware.sections.length).to.equal(numberOfSections);
      done()
    })
    .catch((err) => {
      done(err)
    })
  })
}
describe.only('Firmware', function() {

  describe('#constructor', function () {
    describe('without zip data', function () {
      beforeEach(function() {
        this.firmware = new Firmware()
      })
      afterEach(function () {
        this.firmware = undefined
      })
      it('initalised', function () {
        expect(this.firmware instanceof Firmware).to.equal(true)
      })
      it('not configured', function () {
        expect(this.firmware.type).to.equal(FirmwareType.NotConfigured)
      })
      it('invalid without data', function(done) {
        this.firmware.parseManifest()
        .then(() => {
          expect(this.firmware.type).to.equal(FirmwareType.Invalid);
          done()
        }).catch((err) => {
          done(err)
        })
      })
    })
    describe('with application zip', function () {
      SharedDFUParseZip(this, '/base/test/unit/data/dfu_test_app_hrm_s130.zip',FirmwareType.Application, 1) // < The /base/ is to indicate its been loaded and served with karma
    })
    describe('with softdevice and bootloader zip', function () {
      SharedDFUParseZip(this, '/base/test/unit/data/bl_sd.zip',FirmwareType.SoftdeviceBootloader, 1) // < The /base/ is to indicate its been loaded and served with karma
    })

  })



})
