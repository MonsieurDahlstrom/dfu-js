import {expect} from 'chai'
import factory from '../../factories'
import sinon from 'sinon'
import {TransferObject, TransferObjectState} from '../../../src/models/transfer-object'
import {Transfer} from '../../../src/models/Transfer'
import TransmissionStatus from '../../../src/models/transmission-types'

// import {Task, TaskType, TaskResult} from '../../src/dfu/Task'
//
import crc from 'crc'

describe("TransferObject", function() {

  let transferObject
  let sandbox
  beforeEach(function (done) {
    sandbox = sinon.sandbox.create()
    factory.build('transferObject')
    .then((newTransferObject) => {
      transferObject = newTransferObject
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe("#constructor", function() {
    describe('no parameters', function() {
      it('throws without dataset', function() {
          expect( ()=> new TransferObject()).to.not.throw();
      })
    })
    describe('parameters', function() {
      let transfer
      beforeEach(function (done) {
        factory.build('transfer')
        .then((newTransfer) => {
          transfer = newTransfer
          done()
        })
      })
      it('no errors', function() {
        expect( () => new TransferObject(0,20,transfer,0, function () {} )).to.not.throw();
      })
      it('has offset', function() {
        let transferObject = new TransferObject(0,20,transfer,0, function () {})
        expect(transferObject.offset).to.equal(0)
      })
      it('has a length', function() {
        let transferObject =new TransferObject(0,20,transfer,0, function () {} )
        expect(transferObject.length).to.equal(20)
      })
      it('belongs to a Transfer', function(){
        let transferObject = new TransferObject(0,20,transfer,0, function () {} )
        expect(transferObject.transfer).to.equal(transfer)
      })
    })
  })

})
