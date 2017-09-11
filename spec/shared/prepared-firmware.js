import JSZip from 'jszip'
import {Firmware} from '../../src/models/firmware'

const readFirmwareFromFS = async function (done,testContext,zipFileURL) {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", () => {
    JSZip.loadAsync(oReq.response)
    .then(zip => {
      testContext.firmware = new Firmware(zip)
      return testContext.firmware.parseManifest()
    })
    .then(() => done())
    .catch(err => done(err))
  })
  oReq.open('GET',zipFileURL)
  oReq.responseType = "arraybuffer";
  oReq.send();
}

export default readFirmwareFromFS
