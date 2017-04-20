// Copyright (c) 2017 Monsieur Dahlström Ltd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import {Section} from './Section'

const FirmwareType = {
  Application: 0x01,
  Bootloader: 0x02,
  Softdevice: 0x04,
  SoftdeviceBootloader: 0x08,
  Invalid: 0x10,
  NotConfigured: 0x20,
  NOT_IN_USE_1: 0x40,
  NOT_IN_USE_2: 0x80
}

class Firmware {

  constructor (zipFile) {
    this.type = FirmwareType.NotConfigured
    this.zip = zipFile
    this.sections = []
  }

  async parseManifest () {
    if (!this.zip) {
      this.type = FirmwareType.Invalid
      return
    }
    let content = await this.zip.file('manifest.json').async('string')
    let json = JSON.parse(content)
    if (json.manifest.application) {
      try {
        let bin = await this.zip.file(json.manifest.application.bin_file).async('uint8Array')
        let dat = await this.zip.file(json.manifest.application.dat_file).async('uint8Array')
        let section = new Section(bin, dat, FirmwareType.Application)
        this.sections.push(section)
        this.type = FirmwareType.Application
      } catch (e) {
        console.log(e)
      }
    } else if (json.manifest.bootloader) {
      try {
        let bin = this.zip.file(json.manifest.bootloader.bin_file, 'uint8Array')
        let dat = this.zip.file(json.manifest.bootloader.dat_file, 'uint8Array')
        let section = new Section(bin, dat, FirmwareType.Bootloader)
        this.sections.push(section)
        this.type = FirmwareType.Bootloader
      } catch (e) {
        console.log('WWFirmwareUpdate.parseManifest bootloader ' + e)
      }
    } else if (json.manifest.softdevice) {
      try {
        let bin = this.zip.file(json.manifest.softdevice.bin_file, 'uint8Array')
        let dat = this.zip.file(json.manifest.softdevice.dat_file, 'uint8Array')
        let section = new Section(bin, dat, FirmwareType.Application)
        this.sections.push(section)
        this.type = FirmwareType.Softdevice
      } catch (e) {
        console.log('WWFirmwareUpdate.parseManifest softdevice ' + e)
      }
    } else if (json.manifest.softdevice_bootloader) {
      // TODO: Implmentation needed to handle the dual sizes of both sd and bl.
      this.type = FirmwareType.SoftdeviceBootloader
    } else {
      this.type = FirmwareType.Invalid
    }
  }
}

module.exports.Firmware = Firmware
module.exports.FirmwareType = FirmwareType
module.exports.FirmwareSection = Section
