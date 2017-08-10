import {expect} from 'chai'
import sinon from 'sinon'
//
import factory from '../../factories'
//
import TransmissionStatus from '../../../src/models/transmission-types'
import {Transfer} from '../../../src/models/transfer'

describe('Transfer', function() {

  describe("#constructor", function() {
    describe('without parameters', function() {
      it("no exceptions", function() {
        expect( ()=> new Transfer()).to.not.throw()
      })
    })
    describe('with parameters', function() {
      let dataset
      let packetPoint
      let controlPoint
      let transferObjectType
      let transfer
      beforeEach(function(done) {
        dataset = Array.from({length: 254}, () => Math.floor(Math.random() * 9));
        transferObjectType = (Math.random() <= 0.5) === true ? 1 : 2;
        factory.buildMany("webBluetoothCharacteristic",2)
        .then(result => {
          packetPoint = result[0]
          controlPoint = result[1]
          transfer = new Transfer(dataset,controlPoint,packetPoint,transferObjectType)
          done()
        })
      })
      it("no exceptions", function() {
        expect( ()=> new Transfer(dataset,controlPoint,packetPoint,transferObjectType)).to.not.throw()
      })
      it('should have data', function() {
        expect(transfer.file).to.equal(dataset)
      })
      it('should have data characteristic', function() {
        expect(transfer.packetPoint).to.equal(packetPoint)
      })
      it('should have control point characteristic', function() {
        expect(transfer.controlPoint).to.equal(controlPoint)
      })
      it('should have object type', function() {
        expect(transfer.objectType).to.equal(transferObjectType)
      })
    })
  })


})
