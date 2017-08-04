import {expect} from 'chai'
import factory from "factory-girl"
import CharacteristicFactory from '../../factories/WebBluetoothCharacteristicFactory'

import * as Write from "../../../src/types/write"
import WriteTypes from '../../../src/types/write-types'

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
      characteristic = factory.build('WebBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('without characteristic', function () {
        expect(() => new Write.Verify()).to.throw()
      })
      it('without object type', function () {
        expect(() => new Write.Verify(characteristic)).to.throw()
      })
      it('without numerical object type', function () {
        expect(() => new Write.Verify(characteristic,'hello')).to.throw()
      })
      it('builds', function () {
        expect(() => new Write.Verify(characteristic,0)).not.to.throw()
      })
      describe('properties set', function () {
        let objectType = 0x01
        let characteristic = factory.build('WebBluetoothCharacteristic')
        let write = new Write.Verify(characteristic,objectType)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(WriteTypes.SELECT))
        it('object type is set', () => expect(new Uint8Array(write.bytes)[1]).to.equal(objectType))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Create', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('WebBluetoothCharacteristic')
    })
    describe('#constructor', function() {
      it('without characteristic', function () {
        expect(() => new Write.Create()).to.throw()
      })
      it('without object type', function () {
        expect(() => new Write.Create(characteristic)).to.throw()
      })
      it('invalid object type', function () {
        expect(() => new Write.Create(characteristic,'hello')).to.throw()
      })
      it('without object length', function () {
        expect(() => new Write.Create(characteristic,0)).to.throw()
      })
      it('invalid object length', function () {
        expect(() => new Write.Create(characteristic,0,'hello')).to.throw()
      })
      it('builds', function () {
        expect(() => new Write.Create(characteristic,0,143)).not.to.throw()
      })
      describe('properties set', function () {
        let objectType = 0x01
        let objectLength = 143
        let characteristic = factory.build('WebBluetoothCharacteristic')
        let write = new Write.Create(characteristic,objectType,objectLength)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(WriteTypes.CREATE))
        it('object type is set', () => expect(new Uint8Array(write.bytes)[1]).to.equal(objectType))
        it('object length is set', () => expect(new Uint8Array(write.bytes)[2]).to.equal(objectLength))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('PacketReturnNotification', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('WebBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('without characteristic', function () {
        expect(() => new Write.PacketReturnNotification()).to.throw()
      })
      it('without write count', function () {
        expect(() => new Write.PacketReturnNotification(characteristic)).to.throw()
      })
      it('none numerical package count', function () {
        expect(() => new Write.PacketReturnNotification(characteristic,'hello')).to.throw()
      })
      it('builds', function () {
        expect(() => new Write.PacketReturnNotification(characteristic,250)).not.to.throw()
      })
      describe('properties set', function () {
        let packageCount = 200
        let characteristic = factory.build('WebBluetoothCharacteristic')
        let write = new Write.PacketReturnNotification(characteristic,packageCount)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(WriteTypes.SET_PRN))
        it('object type is set', () => expect(new Uint8Array(write.bytes)[1]).to.equal(packageCount))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Package', function() {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('WebBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('throws without characteristic', function () {
        expect(() => new Write.Package()).to.throw()
      })
      it('throws without buffer', function () {
        expect(() => new Write.Package(characteristic)).to.throw()
      })
      it('throws when buffer not Uint8Array', function () {
        expect(() => new Write.Package(characteristic, 1)).to.throw()
      })
      it('builds', function () {
        var buffer = new Uint8Array(10)
        expect(() => new Write.Package(characteristic,buffer)).not.to.throw()
      })
      describe('properties set', function () {
        let buffer = new Uint8Array([1,11,21,31,41,51])
        let characteristic = factory.build('WebBluetoothCharacteristic')
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
      characteristic = factory.build('WebBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('without characteristic', function () {
        expect(() => new Write.Checksum()).to.throw()
      })
      it('characteristic not an object', function () {
        expect(() => new Write.Checksum(0)).to.throw()
      })
      it('builds', function () {
        expect(() => new Write.Checksum(characteristic)).not.to.throw()
      })
      describe('properties set', function () {
        let characteristic = factory.build('WebBluetoothCharacteristic')
        let write = new Write.Checksum(characteristic)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(WriteTypes.CALCULATE_CHECKSUM))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })

  describe('Execute', function () {
    var characteristic
    beforeEach(function() {
      characteristic = factory.build('WebBluetoothCharacteristic')
    })
    describe('#constructor', function () {
      it('without characteristic', function () {
        expect(() => new Write.Execute()).to.throw()
      })
      it('characteristic not an object', function () {
        expect(() => new Write.Execute(0)).to.throw()
      })
      it('builds', function () {
        expect(() => new Write.Execute(characteristic)).not.to.throw()
      })
      describe('properties set', function () {
        let characteristic = factory.build('WebBluetoothCharacteristic')
        let write = new  Write.Execute(characteristic)
        it('characteristic is set', () => expect(write.characteristic).to.equal(characteristic))
        it('write action is set', () => expect(new Uint8Array(write.bytes)[0]).to.equal(WriteTypes.EXECUTE))
        it('object is instance of Write', () => expect(write instanceof Write.Write).to.equal(true))
      })
    })
  })
})
