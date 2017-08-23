import {expect} from 'chai'
import sinon from 'sinon'
//
import factory from '../../factories'
//
import TransmissionStatus from '../../../../src/models/transmission-types'
import Transfer from '../../../../src/models/transfer'

describe.only('Transfer', function() {

  describe("#constructor", function() {
    describe('without parameters', function() {
      it("no exceptions", function() {
        expect( ()=> new Transfer()).to.not.throw()
      })
    })
    describe('with parameters', function() {
      beforeEach(function(done) {
        this.dataset = Array.from({length: 254}, () => Math.floor(Math.random() * 9));
        this.transferType = (Math.random() <= 0.5) === true ? 1 : 2;
        factory.buildMany("webBluetoothCharacteristic",2)
        .then(result => {
          this.packetPoint = result[0]
          this.controlPoint = result[1]
          this.transfer = new Transfer(this.dataset,this.controlPoint,this.packetPoint,this.transferType)
          done()
        })
      })
      it("no exceptions", function() {
        expect( ()=> new Transfer(this.dataset,this.controlPoint,this.packetPoint,this.transferType)).to.not.throw()
      })
      it('should have data', function() {
        expect(this.transfer.file).to.equal(this.dataset)
      })
      it('should have data characteristic', function() {
        expect(this.transfer.packetPoint).to.equal(this.packetPoint)
      })
      it('should have control point characteristic', function() {
        expect(this.transfer.controlPoint).to.equal(this.controlPoint)
      })
      it('should have object type', function() {
        expect(this.transfer.objectType).to.equal(this.transferType)
      })
    })
  })


})
