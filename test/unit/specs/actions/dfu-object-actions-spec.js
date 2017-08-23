import factory from '../../factories'
import sinon from 'sinon'
import {expect} from 'chai'
import crc from 'crc'
//
import VuexActionTester from '../../helpers/vuex-action-tester'
//
import TransferObjectActions from '../../../../src/actions/dfu-object-actions'
import * as MutationTypes from '../../../../src/mutation-types'
import Write from '../../../../src/models/write'
//

describe.only('DFUObject Actions', function () {

  before(function () {
    this.sandbox = sinon.sandbox.create()
  })
  beforeEach(function (done) {
    factory.create('dfuObject')
    .then((newTransferObject) => {
      this.dfuObject = newTransferObject
      done()
    })
  });
  afterEach(function () {
    this.sandbox.restore()
  });

  describe('#webBluetoothDFUObjectAdd', function () {
    it('object added', function (done) {
      let mutations = [
        {
          type: MutationTypes.ADD_DFU_OBJECT,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.dfuObject)
          }.bind(this)
        }
      ]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectAdd, this.dfuObject, mutations, [], done)
      test.run()
    })
  })

  describe('#webBluetoothDFUObjectUpdated', function () {
    it('object updated', function (done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_DFU_OBJECT,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.dfuObject)
          }.bind(this)
        }
      ]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectUpdated, this.dfuObject, mutations, [], done)
      test.run()
    })
  })

  describe('#webBluetoothDFUObjectRemove', function () {
    it('object removed', function (done) {
      let mutations = [
        {
          type: MutationTypes.REMOVE_DFU_OBJECT,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.dfuObject)
          }.bind(this)
        }
      ]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectRemove, this.dfuObject, mutations, [], done)
      test.run()
    })
  })
  /*
  describe('#webBluetoothDFUObjectToPackets', function () {
    it('creates package', function(done) {
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          return true
      }}]
      let payload = {transferObject: transferObject, offset: 0}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectToPackets, payload, mutations, [], done)
      test.run()
    })
    it('created packages equals src', function(done) {
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          let calculation = []
          for(var chunk of payload.chunks) {
            calculation = calculation.concat(chunk)
          }
          expect(calculation).to.deep.equal(transferObject.transfer.file.slice(transferObject.offset,transferObject.length))
          expect(crc.crc32(calculation)).to.equal(crc.crc32(transferObject.transfer.file.slice(transferObject.offset,transferObject.length)))
          return true
          return true
      }}]
      let payload = {transferObject: transferObject, offset: 0}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectToPackets, payload, mutations, [], done)
      test.run()
    })
  })

  describe("#webBluetoothDFUObjectBegin", function() {
    it('sets state', function(done) {
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          expect(transferObject.state).to.equal(TransferObjectState.Creating)
          return true
      }}]
      let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) {
        expect(payload instanceof Write.Verify).to.be.true
        return true
      }},
      { type: 'webBluetoothDFUExecuteWrite', validation: function(payload) {
        expect(payload instanceof Write.Verify).to.be.true
        return true
      }}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectBegin, transferObject, mutations, dispatches, done)
      test.run()
    })
  })

  describe("#webBluetoothDFUObjectTransferDataPackages", function() {
    it('sets state', function(done) {
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
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectTransferDataPackages, transferObject, mutations, dispatches, done)
      test.run()
    })
  })

  describe("#webBluetoothDFUObjectValidate", function() {

    describe('with valid crc', function() {
      let transferObjectCRC
      beforeEach(function() {
        transferObjectCRC = crc.crc32(transferObject.transfer.file.slice(0,20))
      })
      it('offset larger then content', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 35, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
      it('offset is zero', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 0, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
      it('offset set to content length', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 20, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Execute).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
      it('offset > 0 && offset < content length', function(done) {
        transferObjectCRC = crc.crc32(transferObject.transfer.file.slice(0,1))
        let payload = {checksum: transferObjectCRC, offset: 1, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [
          { type: 'webBluetoothDFUObjectToPackets', validation: function(payload) { expect(payload).to.equal(transferObject); return true}},
          { type: 'webBluetoothDFUObjectSetPacketReturnNotification', validation: function(payload) { expect(payload).to.equal(transferObject); return true}},
          { type: 'webBluetoothDFUObjectTransferDataPackages', validation: function(payload) { expect(payload).to.equal(transferObject); return true}}
        ]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
    })

    describe('invalid src', function() {
      let transferObjectCRC
      beforeEach(function() {
        transferObject.transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        transferObjectCRC = crc.crc32(transferObject.transfer.file.slice(0,85))
      })
      it('offset larger then content', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 35, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
      it('offset is zero', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 0, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
      it('offset set to content length', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 20, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
      it('offset > 0 && offset < content length', function(done) {
        let payload = {checksum: transferObjectCRC, offset: 1, transferObject: transferObject}
        let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
        let dispatches = [{ type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Create).to.equal(true); return true}}]
        var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectValidate, payload, mutations, dispatches, done)
        test.run()
      })
    })
  })

  describe("#webBluetoothDFUObjectSetPacketReturnNotification", function() {
    it('slots a task for each data chunck in the transfer', function(done) {
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) {
          expect(payload).to.deep.equal(transferObject)
          return true
      }}]
      let dispatches = [
        { type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.PacketReturnNotification).to.equal(true); return true}}
      ]
      transferObject.chunks.push([1,2,3,4,5,6])
      transferObject.chunks.push([7,8,9,10])
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectSetPacketReturnNotification, transferObject, mutations, dispatches, done)
      test.run()
    })
  })

  describe("#webBluetoothDFUObjectHandleEvent", function() {
    let eventData
    let payload
    let circumstance
    let validationFunc
    beforeEach(function() {
      eventData = new DataView(new ArrayBuffer(15))
      payload = {dataView: eventData, transferObject: transferObject}
      validationFunc =  function(payload) {
        expect(payload.opCode).to.not.be.undefined
        expect(payload.responseCode).to.not.be.undefined
        expect(payload.dataView).to.be.an.instanceof(DataView)
        expect(payload.transferObject).to.equal(transferObject)
        return true
      }
    })
    it('schedules event handling in .Creating state', function (done) {
      transferObject.state = TransferObjectState.Creating
      let dispatches = [{ type: 'webBluetoothDFUObjectHandleEventWhileCreating', validation:validationFunc}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEvent, payload, [], dispatches, done)
      test.run()
    })
    it('schedules event handling in .Storing state', function (done) {
      transferObject.state = TransferObjectState.Storing
      let dispatches = [{ type: 'webBluetoothDFUObjectHandleEventWhileStoring', validation:validationFunc}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEvent, payload, [], dispatches, done)
      test.run()
    })
    it('schedules event handling in .Transfering state', function (done) {
      transferObject.state = TransferObjectState.Transfering
      let dispatches = [{ type: 'webBluetoothDFUObjectHandleEventWhileTransfering', validation:validationFunc}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEvent, payload, [], dispatches, done)
      test.run()
    })
  })

  describe('webBluetoothDFUObjectHandleEventWhileCreating', function () {
    it('handles TaskType.SELECT repsonse', function(done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.SELECT)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      eventData.setUint32(7, 456789, true) //offset
      eventData.setUint32(11, 987654, true) // checsu
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.SELECT, responseCode: Write.Responses.SUCCESS}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
      let dispatches = [{ type: 'webBluetoothDFUObjectValidate', validation: function(payload) {
        expect(payload.transferObject).to.equal(transferObject)
        expect(payload.checksum).to.equal(987654)
        expect(payload.offset).to.equal(456789)
        return true
      }}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileCreating, payload, mutations, dispatches, done)
      test.run()
    })
    it('handles TaskType.CREATE repsonse', function (done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.CREATE)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.CREATE, responseCode: Write.Responses.SUCCESS}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
      let dispatches = [
        { type: 'webBluetoothDFUObjectToPackets', validation: function(payload) { expect(payload).to.equal(transferObject); return true }},
        { type: 'webBluetoothDFUObjectSetPacketReturnNotification', validation: function(payload) { expect(payload).to.equal(transferObject); return true }},
        { type: 'webBluetoothDFUObjectTransferDataPackages', validation: function(payload) { expect(payload).to.equal(transferObject); return true }}
      ]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileCreating, payload, mutations, dispatches, done)
      test.run()
    })
    it('handles TaskType.SET_PRN repsonse', function(done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.SET_PRN)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.SET_PRN, responseCode: Write.Responses.SUCCESS}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileCreating, payload, [], [], done)
      test.run()
    })
  })

  describe('webBluetoothDFUObjectHandleEventWhileTransfering', function () {
    it('handles TaskType.CALCULATE_CHECKSUM repsonse', function (done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.CALCULATE_CHECKSUM)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      eventData.setUint32(7, 456789, true) //offset
      eventData.setUint32(11, 987654, true) // checsu
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.CALCULATE_CHECKSUM, responseCode: Write.Responses.SUCCESS}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
      let dispatches = [{ type: 'webBluetoothDFUObjectValidate', validation: function(payload) {
        expect(payload.transferObject).to.equal(transferObject)
        expect(payload.checksum).to.equal(987654)
        expect(payload.offset).to.equal(456789)
        return true
      }}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileTransfering, payload, mutations, dispatches, done)
      test.run()
    })
    it('handles TaskType.SET_PRN repsonse', function (done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.SET_PRN)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.SET_PRN, responseCode: Write.Responses.SUCCESS}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileTransfering, payload, [], [], done)
      test.run()
    })
  })

  describe('webBluetoothDFUObjectHandleEventWhileStoring', function () {
    it('handles TaskType.EXECUTE repsonse', function (done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.EXECUTE)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.EXECUTE, responseCode: Write.Responses.SUCCESS}
      let mutations = [{ type: MutationTypes.UPDATE_TRANSFER_OBJECT, validation: function(payload) { return true}}]
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileStoring, payload, mutations, [], done)
      test.run()
    })
    it('handles TaskType.SET_PRN repsonse', function (done) {
      var eventData = new DataView(new ArrayBuffer(15))
      eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
      eventData.setUint8(1,Write.Actions.SET_PRN)
      eventData.setUint8(2,Write.Responses.SUCCESS)
      let payload = {dataView: eventData, transferObject: transferObject, opCode: Write.Actions.SET_PRN, responseCode: Write.Responses.SUCCESS}
      var test = new VuexActionTester(TransferObjectActions.webBluetoothDFUObjectHandleEventWhileStoring, payload, [], [], done)
      test.run()
    })
  })
  */
})
