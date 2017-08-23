import {expect} from 'chai'
import factory from '../../factories'

import Write from "../../../../src/models/write"
import {DFUObject} from '../../../../src/models/dfu-object'

describe("Write module", function() {

  describe('exports', function () {
    it('Verify', function () {
      expect(Write.Verify).to.not.be.undefined
    })
    it('Create', function () {
      expect(Write.Create).to.not.be.undefined
    })
    it('PacketReturnNotification', function () {
      expect(Write.PacketReturnNotification).to.not.be.undefined
    })
    it('Package', function () {
      expect(Write.Package).to.not.be.undefined
    })
    it('Checksum', function () {
      expect(Write.Checksum).to.not.be.undefined
    })
    it('Execute', function () {
      expect(Write.Execute).to.not.be.undefined
    })
  })

  describe.only('Verify', function() {
    beforeEach(function(done) {
      this.transferObject = new DFUObject()
      factory.create('webBluetoothCharacteristic')
      .then(characteristic => {
        this.characteristic = characteristic
        this.objectType = 0x01
        this.write = new Write.Verify(this.transferObject, this.characteristic, this.objectType)
        done()
      })
    })
    it('#constructor', function () {
      expect(() => new Write.Verify(this.transferObject, this.characteristic, 0x02)).not.to.throw()
    })
    it('characteristic is set', function () {
      expect(this.write.characteristic).to.equal(this.characteristic)
    })
    it('write action is set', function () {
       expect(new Uint8Array(this.write.bytes)[0]).to.equal(Write.Actions.SELECT)
     })
    it('object type is set', function() {
      expect(new Uint8Array(this.write.bytes)[1]).to.equal(this.objectType)
    })
    it('object is instance of Write', function () {
      expect(this.write instanceof Write.Write).to.equal(true)
    })
    it('object is instance of Verify', function () {
      expect(this.write instanceof Write.Verify).to.equal(true)
    })
    it('transferObject set', function () {
      expect(this.write.object).to.equal(this.transferObject)
    })
  })

  describe.only('Create', function() {
    beforeEach(function(done) {
      this.transferObject = new DFUObject()
      factory.create('webBluetoothCharacteristic')
      .then(characteristic => {
        this.characteristic = characteristic
        this.objectType = 0x01
        this.objectLength = 143
        this.write = new Write.Create(this.transferObject, this.characteristic, this.objectType, this.objectLength)
        done()
      })
    })
    it('#constructor', function () {
      expect(() => new Write.Create(this.transferObject, this.characteristic, this.objectLength)).not.to.throw()
    })
    it('characteristic is set', function () {
      expect(this.write.characteristic).to.equal(this.characteristic)
    })
    it('write action is set', function () {
       expect(new Uint8Array(this.write.bytes)[0]).to.equal(Write.Actions.CREATE)
     })
    it('object type is set', function() {
      expect(new Uint8Array(this.write.bytes)[1]).to.equal(this.objectType)
    })
    it('object is instance of Write', function () {
      expect(this.write instanceof Write.Write).to.equal(true)
    })
    it('object is instance of Create', function () {
      expect(this.write instanceof Write.Create).to.equal(true)
    })
    it('transferObject set', function () {
      expect(this.write.object).to.equal(this.transferObject)
    })
    it('object length is set', function () {
      expect(new Uint8Array(this.write.bytes)[2]).to.equal(this.objectLength)
    })
  })

  describe.only('PacketReturnNotification', function() {
    beforeEach(function(done) {
      this.transferObject = new DFUObject()
      factory.create('webBluetoothCharacteristic')
      .then(characteristic => {
        this.characteristic = characteristic
        this.prnValue = 250
        this.write = new Write.PacketReturnNotification(this.transferObject, this.characteristic, this.prnValue)
        done()
      })
    })
    it('#constructor', function () {
      expect(() => new Write.PacketReturnNotification(this.transferObject, this.characteristic, this.prnValue)).not.to.throw()
    })
    it('characteristic is set', function () {
      expect(this.write.characteristic).to.equal(this.characteristic)
    })
    it('write action is set', function () {
       expect(new Uint8Array(this.write.bytes)[0]).to.equal(Write.Actions.SET_PRN)
     })
    it('object is instance of Write', function () {
      expect(this.write instanceof Write.Write).to.equal(true)
    })
    it('object is instance of PacketReturnNotification', function () {
      expect(this.write instanceof Write.PacketReturnNotification).to.equal(true)
    })
    it('transferObject set', function () {
      expect(this.write.object).to.equal(this.transferObject)
    })
    it('PRN is set', function () {
      expect(new Uint8Array(this.write.bytes)[1]).to.equal(this.prnValue)
    })
  })

  describe.only('Package', function() {
    beforeEach(function(done) {
      this.transferObject = new DFUObject()
      factory.create('webBluetoothCharacteristic')
      .then(characteristic => {
        this.characteristic = characteristic
        this.writeBuffer = new Uint8Array(10)
        this.write = new Write.Package(this.transferObject, this.characteristic, this.writeBuffer)
        done()
      })
    })
    it('#constructor', function () {
      expect(() => new Write.Package(this.transferObject, this.characteristic, this.writeBuffer)).not.to.throw()
    })
    it('characteristic is set', function () {
      expect(this.write.characteristic).to.equal(this.characteristic)
    })
    it('object is instance of Write', function () {
      expect(this.write instanceof Write.Write).to.equal(true)
    })
    it('object is instance of Package', function () {
      expect(this.write instanceof Write.Package).to.equal(true)
    })
    it('data is set', function () {
      expect(this.write.bytes).to.deep.equal(this.writeBuffer)
    })
  })

  describe.only('Checksum', function () {
    beforeEach(function(done) {
      this.transferObject = new DFUObject()
      factory.create('webBluetoothCharacteristic')
      .then(characteristic => {
        this.characteristic = characteristic
        this.write = new Write.Checksum(this.transferObject, this.characteristic)
        done()
      })
    })
    it('#constructor', function () {
      expect(() => new Write.Checksum(this.transferObject, this.characteristic)).not.to.throw()
    })
    it('characteristic is set', function () {
      expect(this.write.characteristic).to.equal(this.characteristic)
    })
    it('object is instance of Write', function () {
      expect(this.write instanceof Write.Write).to.equal(true)
    })
    it('object is instance of Checksum', function () {
      expect(this.write instanceof Write.Checksum).to.equal(true)
    })
  })

  describe.only('Execute', function () {
    beforeEach(function(done) {
      this.transferObject = new DFUObject()
      factory.create('webBluetoothCharacteristic')
      .then(characteristic => {
        this.characteristic = characteristic
        this.write = new Write.Execute(this.transferObject, this.characteristic)
        done()
      })
    })
    it('#constructor', function () {
      expect(() => new Write.Execute(this.transferObject, this.characteristic)).not.to.throw()
    })
    it('characteristic is set', function () {
      expect(this.write.characteristic).to.equal(this.characteristic)
    })
    it('object is instance of Write', function () {
      expect(this.write instanceof Write.Write).to.equal(true)
    })
    it('object is instance of Execute', function () {
      expect(this.write instanceof Write.Execute).to.equal(true)
    })
  })
})
