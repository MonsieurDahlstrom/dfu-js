import {Firmware,FirmwareType} from '../../src/firmware'
import JSZip from 'jszip'
import fs from 'fs'

describe('Firmware', function() {

  let firmware;

  afterEach(function() {
    firmware = null;
  })

  it("is not configured when created", function() {
    firmware = new Firmware();
    expect(firmware).toBeTruthy();
    expect(firmware.type).toBe(FirmwareType.NotConfigured);
  })

  it('is invalid without data', function() {
    this.executeAsyncMethod(async function() {
      firmware = new Firmware();
      await firmware.parseManifest();
      expect(firmware.type).toBe(FirmwareType.Invalid);
    })
  });

  it('valid application firmware with valid zip', function() {
    this.executeAsyncMethod(async function() {
      let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
      let zip = await JSZip.loadAsync(content)
      firmware = new Firmware(zip);
      await firmware.parseManifest();
      expect(firmware.type).toBe(FirmwareType.Application);
      expect(firmware.sections.length).toBe(1);
    })
  });

  it('valid softdevice and bootloader with valid zip', function() {
    this.executeAsyncMethod(async function() {
      let content = fs.readFileSync('spec/data/bl_sd.zip')
      let zip = await JSZip.loadAsync(content)
      firmware = new Firmware(zip);
      await firmware.parseManifest();
      expect(firmware.type).toBe(FirmwareType.SoftdeviceBootloader);
      expect(firmware.sections.length).toBe(1);
    })
  });


})
