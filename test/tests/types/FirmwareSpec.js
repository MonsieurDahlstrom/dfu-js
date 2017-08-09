import {expect} from 'chai'
import {Firmware,FirmwareType} from '../../../src/models/firmware'
import JSZip from 'jszip'
import fs from 'fs'

const SharedDFUParseZip = function (context, testZipPath, expectedType, numberOfSections) {
  beforeEach(function (done) {
    JSZip.loadAsync(fs.readFileSync(testZipPath))
    .then(function(zip) {
      context.firmware = new Firmware(zip)
      done()
    })
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
describe('Firmware', function() {

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
      SharedDFUParseZip(this, 'test/data/dfu_test_app_hrm_s130.zip',FirmwareType.Application, 1)
    })
    describe('with softdevice and bootloader zip', function () {
      SharedDFUParseZip(this, 'test/data/bl_sd.zip',FirmwareType.SoftdeviceBootloader, 1)
    })

  })



})
