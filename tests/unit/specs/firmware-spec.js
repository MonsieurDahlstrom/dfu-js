import {expect} from 'chai'

import {Firmware,FirmwareType} from '../../../src/models/firmware'
import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'

const SharedDFUParseZip = function (context, testZipPath, expectedType, numberOfSections) {
  beforeEach(async function () {
    let filePathResolved = path.resolve(testZipPath)
    let data = fs.readFileSync(filePathResolved);
    return JSZip.loadAsync(data)
    .then( zip => context.firmware = new Firmware(zip))
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

  let firmware;

  afterEach(function() {
    firmware = null;
  })

  describe("#constructor", function () {
    it('empty should be invalid', function () {
      expect(() => new Firmware()).to.throw();
    })
    it('with jszip archive it should be valid', function () {
      var zip = new JSZip()
      var firmware
      expect(() => firmware = new Firmware(zip)).to.not.throw();
      expect(firmware.type).to.equal(FirmwareType.NotConfigured);
    })
  })

  describe('#parseManifest', function () {

  })

  describe('with application zip', function () {
    SharedDFUParseZip(this, 'tests/unit/data/dfu_test_app_hrm_s130.zip',FirmwareType.Application, 1) // < The /base/ is to indicate its been loaded and served with karma
  })

  describe('with softdevice and bootloader zip', function () {
    SharedDFUParseZip(this, 'tests/unit/data/bl_sd.zip',FirmwareType.SoftdeviceBootloader, 1) // < The /base/ is to indicate its been loaded and served with karma
  })

  describe('with bootloader zip', function () {
    SharedDFUParseZip(this, 'tests/unit/data/bl.zip',FirmwareType.Bootloader, 1) // < The /base/ is to indicate its been loaded and served with karma
  })

})
