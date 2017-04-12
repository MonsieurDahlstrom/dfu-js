import {Firmware,FirmwareType} from '../../src/firmware'
import JSZip from 'jszip'
import fs from 'fs'

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, e => { fail(e); done(); });
  };
}

describe('Firmware', function() {

  let firmware;

  afterEach(function() {
    firmware = null;
  })

  it("should be not configured when created", function() {
    firmware = new Firmware();
    expect(firmware).toBeTruthy();
    expect(firmware.type).toBe(FirmwareType.NotConfigured);
  })

  it('should be invalid without data', testAsync(async function() {
    firmware = new Firmware();
    await firmware.parseManifest();
    expect(firmware.type).toBe(FirmwareType.Invalid);
  }));

  it('should be valid application firmware with valid zip', testAsync(async function() {
    let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
    let zip = await JSZip.loadAsync(content)
    firmware = new Firmware(zip);
    await firmware.parseManifest();
    expect(firmware.type).toBe(FirmwareType.Application);
    expect(firmware.sections.length).toBe(1);
  }));
  
})
