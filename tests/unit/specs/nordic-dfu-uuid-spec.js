import {expect} from 'chai'

import {DFUServiceUUID, DFUCharacteristicUUID} from '../../../src'

describe('Nordic Semiconductor UUID', function() {

  describe("Buttonless DFU", function () {
    it("service uuid", () => expect(DFUServiceUUID.Buttonless).to.exist )
    it("packet & control point characteristic uuid", () => expect(DFUCharacteristicUUID.Buttonless).to.exist)
  })
  describe("Secure DFU", function () {
    it("service uuid", () => expect(DFUServiceUUID.DFU).to.exist )
    it("packet point characteristic uuid", () => expect(DFUCharacteristicUUID.PacketPoint).to.exist)
    it("control point characteristic uuid", () => expect(DFUCharacteristicUUID.ControlPoint).to.exist)
  })
})
