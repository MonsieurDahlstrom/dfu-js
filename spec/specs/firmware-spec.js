import {expect} from 'chai'

import {Firmware,FirmwareType} from '../../src/models/firmware'
import JSZip from 'jszip'
import fs from 'fs'

describe('Firmware', function() {

  let firmware;

  afterEach(function() {
    firmware = null;
  })

  it("is not configured when created", function() {
    firmware = new Firmware();
    expect(firmware instanceof Firmware).to.be.true;
    expect(firmware.type).to.equal(FirmwareType.NotConfigured);
  })

  it('is invalid without data', function(done) {
    firmware = new Firmware();
    firmware.parseManifest()
    .then(() => {
      expect(firmware.type).to.equal(FirmwareType.Invalid);
      done()
    })
  });

  it('valid application firmware with valid zip', function(done) {
    let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
    JSZip.loadAsync(content)
    .then(zip => {
      firmware = new Firmware(zip);
      firmware.parseManifest()
      .then(() => {
        expect(firmware.type).to.equal(FirmwareType.Application);
        expect(firmware.sections.length).to.equal(1);
        done()
      })
    })
  });

  it('valid softdevice and bootloader with valid zip', function(done) {
    let content = fs.readFileSync('spec/data/bl_sd.zip')
    JSZip.loadAsync(content)
    .then(zip => {
      firmware = new Firmware(zip);
      firmware.parseManifest()
      .then(() => {
        expect(firmware.type).to.equal(FirmwareType.SoftdeviceBootloader);
        expect(firmware.sections.length).to.equal(1);
        done()
      })
    })

  });


})
