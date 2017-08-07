import factory from '../../factories'
import sinon from 'sinon'
import {expect} from 'chai'
import crc from 'crc'
//
import VuexActionTester from '../../helpers/vuex-action-tester'
//
import TransferObjectActions from '../../../src/actions/transfer-object-actions'
import * as MutationTypes from '../../../src/mutation-types'
import * as Writes from '../../../src/types/write'
import {TransferObjectState} from '../../../src/types/transfer-object'

describe.only('TransferObject Actions', function () {

  let sandbox
  let transferObject
  let state
  beforeEach(function (done) {
    sandbox = sinon.sandbox.create()
    state = {writes: [], objects: []}
    factory.create('transferObject')
    .then((newTransferObject) => {
      transferObject = newTransferObject
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe('#webBluetoothDFUObjectToPackets', function () {
    it('creates package', function(done) {
      let circumstance = {state: state, validation: function () {
        expect(transferObject.chunks).to.be.an('array')
        return true
      }}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          return true
      }}]
      let payload = {transferObject: transferObject, offset: 0}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectToPackets, payload, circumstance, mutations, [], done)
      test.run()
    })
    it('created packages equals src', function(done) {
      let circumstance = {state: state, validation: function () {
        let calculation = []
        for(var chunk of transferObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(calculation).to.deep.equal(transferObject.transfer.file.slice(transferObject.offset,transferObject.length))
        expect(crc.crc32(calculation)).to.equal(crc.crc32(transferObject.transfer.file.slice(transferObject.offset,transferObject.length)))
        return true
      }}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          return true
      }}]
      let payload = {transferObject: transferObject, offset: 0}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectToPackets, payload, circumstance, mutations, [], done)
      test.run()
    })
  })

  describe("#webBluetoothDFUObjectBegin", function() {
    it('sets state', function(done) {
      let circumstance = {state: state, validation: function () {
        expect(transferObject.state).to.equal(TransferObjectState.Creating)
        return true
      }}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          return true
      }}]
      let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) {
        expect(payload instanceof Writes.Verify).to.be.true
        return true
      }},
      { type: 'webBluetoothDFUExecuteWrite', validation: function(payload) {
        expect(payload instanceof Writes.Verify).to.be.true
        return true
      }}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectBegin, transferObject, circumstance, mutations, dispatches, done)
      test.run()
    })
  })

  describe("#webBluetoothDFUObjectTransferDataPackages", function() {
    it('sets state', function(done) {
      let circumstance = {state: state, validation: function () {return true}}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          return true
      }}]
      let dispatches = [
        { type: 'webBluetoothDFUScheduleWrite', validation: function(payload) {return true}},
        { type: 'webBluetoothDFUScheduleWrite', validation: function(payload) {return true}},
        { type: 'webBluetoothDFUExecuteWrite', validation: function(payload) {return true}}
      ]
      transferObject.chunks.push([1,2,3,4,5,6])
      transferObject.chunks.push([7,8,9,10])
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectTransferDataPackages, transferObject, circumstance, mutations, dispatches, done)
      test.run()
    })
  })

  describe.only("#webBluetoothDFUObjectValidate", function() {

    describe('with valid crc', function() {
      let transferObjectCRC
      beforeEach(function() {
        transferObjectCRC = crc.crc32(transferObject.transfer.file.slice(0,20))
      })
      it('offset larger then content', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 35, transferObject: transferObject}
        let circumstance = {state: state, validation: function () {return true}}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Writes.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, circumstance, mutations, dispatches, done)
        test.run()
      })
      it('offset is zero', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 0, transferObject: transferObject}
        let circumstance = {state: state, validation: function () {return true}}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Writes.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, circumstance, mutations, dispatches, done)
        test.run()
      })
      it('offset set to content length', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 20, transferObject: transferObject}
        let circumstance = {state: state, validation: function () {return true}}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Writes.Execute).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, circumstance, mutations, dispatches, done)
        test.run()
      })
      it('offset > 0 && offset < content length', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 1, transferObject: transferObject}
        let circumstance = {state: state, validation: function () {return true}}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [
          { type: 'webBluetoothDFUObjectToPackets', validation: function(payload) { expect(payload).to.equal(transferObject); return true}},
          { type: 'webBluetoothDFUObjectSetPacketReturnNotification', validation: function(payload) { expect(payload).to.equal(transferObject); return true}},
          { type: 'webBluetoothDFUObjectTransferDataPackages', validation: function(payload) { expect(payload).to.equal(transferObject); return true}}
        ]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, circumstance, mutations, dispatches, done)
        test.run()
      })
    })

    /*
    describe('invalid src', function() {
      let transfer
      let transferObject
      let transferObjectCRC
      let transferObjectTransferSpy
      beforeEach(function() {
        transfer = jasmine.createSpyObj('Transfer',['addTask'])
        transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        transferObject = new TransferObject(0,20,transfer,1, function() {})
        transferObjectCRC = crc.crc32(transfer.file.slice(0,85))
        transferObjectTransferSpy = spyOn(transferObject,'transfer')
      })
      it('offset larger then content', function() {
        transferObject.validate(35,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset is zero', function() {
        transferObject.validate(0,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset set to content length', function() {
        transferObject.validate(20,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset > 0 && offset < content length', function() {
        transferObject.validate(1,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
    })
    */
  })

})
