import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'

import {Firmware} from '../../../src/models/firmware'

const readFirmwareFromFS = async function (testContext,zipFileURL) {

  let filePathResolved = path.resolve(zipFileURL)
  let data = fs.readFileSync(filePathResolved);
  return JSZip.loadAsync(data)
  .then( zip => {
    testContext.firmware = new Firmware(zip)
    return testContext.firmware.parseManifest()
  })

  /**
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
  **/
}

export default readFirmwareFromFS
