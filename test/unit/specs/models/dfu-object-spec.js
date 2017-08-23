import {expect} from 'chai'
import factory from '../../factories'
import sinon from 'sinon'
import {DFUObject, States, Types} from '../../../../src/models/dfu-object'
import TransmissionStatus from '../../../../src/models/transmission-types'

// import {Task, TaskType, TaskResult} from '../../src/dfu/Task'
//
import crc from 'crc'

describe.only("DFUObject", function() {
  before(function () {
    this.sandbox = sinon.sandbox.create()
  })
  afterEach(function () {
    this.sandbox.restore()
  })

  describe("#constructor", function() {
    describe('no parameters', function() {
      it('throws without dataset', function() {
          expect( ()=> new DFUObject()).to.not.throw();
      })
    })
    describe('parameters', function() {
      beforeEach(function (done) {
        factory.build('transfer')
        .then((newTransfer) => {
          this.transfer = newTransfer
          done()
        })
      })
      it('no errors', function() {
        expect( () => new DFUObject(0,20,this.transfer,0, function () {} )).to.not.throw();
      })
      it('has offset', function() {
        let transferObject = new DFUObject(0,20,this.transfer,0, function () {})
        expect(transferObject.offset).to.equal(0)
      })
      it('has a length', function() {
        let transferObject = new DFUObject(0,20,this.transfer,0, function () {} )
        expect(transferObject.length).to.equal(20)
      })
      it('belongs to a Transfer', function(){
        let transferObject = new DFUObject(0,20,this.transfer,0, function () {} )
        expect(transferObject.transfer).to.equal(this.transfer)
      })
    })
  })

})
