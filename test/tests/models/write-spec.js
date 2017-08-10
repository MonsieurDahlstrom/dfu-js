import {expect} from 'chai'
import factory from '../../factories'

import Write from "../../../src/models/write"

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

  describe('Verify', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('webBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('builds', function () {
        expect(() => new Write.Verify(characteristic,0)).not.to.throw()
      })
      describe('properties set', function () {
        let objectType = 0x01
        let characteristic = factory.build('webBluetoothCharacteristic')
        let write = new Write.Verify(characteristic,objectType)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(Write.Actions.SELECT))
        it('object type is set', () => expect(new Uint8Array(write.bytes)[1]).to.equal(objectType))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Create', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('webBluetoothCharacteristic')
    })
    describe('#constructor', function() {
      it('builds', function () {
        expect(() => new Write.Create(characteristic,0,143)).not.to.throw()
      })
      describe('properties set', function () {
        let objectType = 0x01
        let objectLength = 143
        let characteristic = factory.build('webBluetoothCharacteristic')
        let write = new Write.Create(characteristic,objectType,objectLength)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(Write.Actions.CREATE))
        it('object type is set', () => expect(new Uint8Array(write.bytes)[1]).to.equal(objectType))
        it('object length is set', () => expect(new Uint8Array(write.bytes)[2]).to.equal(objectLength))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('PacketReturnNotification', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('webBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('builds', function () {
        expect(() => new Write.PacketReturnNotification(characteristic,250)).not.to.throw()
      })
      describe('properties set', function () {
        let packageCount = 200
        let characteristic = factory.build('webBluetoothCharacteristic')
        let write = new Write.PacketReturnNotification(characteristic,packageCount)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(Write.Actions.SET_PRN))
        it('object type is set', () => expect(new Uint8Array(write.bytes)[1]).to.equal(packageCount))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Package', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('webBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('builds', function () {
        var buffer = new Uint8Array(10)
        expect(() => new Write.Package(characteristic,buffer)).not.to.throw()
      })
      describe('properties set', function () {
        let buffer = new Uint8Array([1,11,21,31,41,51])
        let characteristic = factory.build('webBluetoothCharacteristic')
        let write = new Write.Package(characteristic,buffer)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)).to.deep.equal(buffer))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Checksum', function () {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('webBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('builds', function () {
        expect(() => new Write.Checksum(characteristic)).not.to.throw()
      })
      describe('properties set', function () {
        let characteristic = factory.build('webBluetoothCharacteristic')
        let write = new Write.Checksum(characteristic)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(Write.Actions.CALCULATE_CHECKSUM))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Execute', function () {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('webBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('builds', function () {
        expect(() => new Write.Execute(characteristic)).not.to.throw()
      })
      describe('properties set', function () {
        let characteristic = factory.build('webBluetoothCharacteristic')
        let write = new  Write.Execute(characteristic)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(Write.Actions.EXECUTE))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })
})
