import sinon from 'sinon'
import {expect} from 'chai'
import crc from 'crc'
//
import VuexActionTester from '../../helpers/vuex-action-tester'
import factory from '../../factories'
//
import Write from '../../../src/models/write'

import * as MutationTypes from '../../../src/mutation-types'
import TransferActions from '../../../src/actions/transfer-actions'
import {TransferObject} from '../../../src/models/transfer-object'
import TransmissionStatus from '../../../src/models/transmission-types'

import {Transfer} from '../../../src/models/transfer'

const SharedInvalidEventTests = function (state) {
  it('handles none response codes', function(done) {
    this.transfer.state = state
    var eventData = new DataView(new ArrayBuffer(15))
    eventData.setUint8(0,Write.Actions.EXECUTE)
    var payload = {dataView: eventData, transfer: this.transfer}
    var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferEventHandler, payload, [], [], done)
    test.run()
  })
}

const SharedPassEventToTransferObject = function (state) {
  it('passes event to transfer object', function(done) {
    this.transfer.state = state
    var eventData = new DataView(new ArrayBuffer(15))
    eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
    eventData.setUint8(1, Write.Actions.SET_PRN)
    eventData.setUint8(2, Write.Responses.SUCCESS)
    let dispatches = [
      {
        type: 'webBluetoothDFUObjectHandleEvent',
        validation: function (payload) {
          expect(payload.dataView instanceof DataView).to.be.true
          expect(payload.transferObject instanceof TransferObject).to.be.true
        }
      }
    ]
    factory.build('transferObject')
    .then((object) => {
      this.transfer.objects = [object]
      this.transfer.currentObjectIndex = 0
      var payload = {dataView: eventData, transfer: this.transfer}
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferEventHandler, payload, [], dispatches, done)
      test.run()
    })
  })
}

describe('Transfer Actions', function () {

  beforeEach(function (done) {
    this.sandbox = sinon.sandbox.create()
    factory.create('transfer')
    .then((newTransfer) => {
      this.transfer = newTransfer
      done()
    })
  });
  afterEach(function () {
    this.sandbox.restore()
    this.transfer = undefined
  });

  describe('#webBluetoothDFUTransferAdd', function () {
    it('create callback', function (done) {
      let mutations = [
        {
          type: MutationTypes.ADD_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.transfer);
            expect(payload.controlPointEventHandler).to.be.an('function')
          }.bind(this)
        }
      ]
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferAdd, this.transfer, mutations,[], done)
      test.run()
    })
  })

  describe('#webBluetoothDFUTransferRemove', function () {
    it('removes callback', function (done) {
      let mutations = [
        {
          type: MutationTypes.REMOVE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.transfer);
            expect(payload.controlPointEventHandler).to.be.undefined
          }.bind(this)
        }
      ]
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferRemove, this.transfer, mutations,[], done)
      test.run()
    })
  })

  describe("#webBluetoothDFUTransferBegin", function() {
    it("does not throw", function(done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.transfer)
          }.bind(this)
        }
      ]
      let dispatches = [
        { type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Write.Verify).to.equal(true) }},
        { type: 'webBluetoothDFUExecuteWrite', validation: function(payload) { expect(payload instanceof Write.Verify).to.equal(true) }}

      ]
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferBegin, this.transfer, mutations, dispatches, done)
      test.run()
    })
  })

  describe('#webBluetoothDFUTransferPrepare', function () {
    describe("file size smaller then maximum object size", function() {
      let fileData
      beforeEach(function() {
        fileData = Array.from({length: 29}, () => Math.floor(Math.random() * 9))
        this.transfer.file = fileData
      })
      it('has one object to transfer', function(done) {
        let mutations = [
          {
            type: MutationTypes.UPDATE_TRANSFER,
            validation: function(payload) {
              expect(payload).to.deep.equal(this.transfer)
              expect(this.transfer.objects.length).to.equal(1);
            }.bind(this)
          }
        ]
        let dispatches = [
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(this.transfer)
            }.bind(this)
          },
          {
            type: 'webBluetoothDFUObjectValidate',
            validation: function (payload) {
              expect(payload.transferObject instanceof TransferObject).to.equal(true)
              expect(payload.checksum).to.not.be.undefined
              expect(payload.offset).to.not.be.undefined
            }
          }
        ]
        let payload = {checksum: 0, offset: 0, maxiumSize: 255, transfer: this.transfer}
        var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferPrepare, payload, mutations, dispatches, done)
        test.run()
      })
    })
    describe("content length equal to object size", function() {
      let fileData
      beforeEach(function() {
        fileData = Array.from({length: 255}, () => Math.floor(Math.random() * 9))
        this.transfer.file = fileData
      })
      it('has one object to transfer', function(done) {
        let mutations = [
          {
            type: MutationTypes.UPDATE_TRANSFER,
            validation: function(payload) {
              expect(payload).to.deep.equal(this.transfer)
              expect(this.transfer.objects.length).to.equal(1);
            }.bind(this)
          }
        ]
        let dispatches = [
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(this.transfer)
            }.bind(this)
          },
          {
            type: 'webBluetoothDFUObjectValidate',
            validation: function (payload) {
              expect(payload.transferObject instanceof TransferObject).to.equal(true)
              expect(payload.checksum).to.not.be.undefined
              expect(payload.offset).to.not.be.undefined
            }
          }
        ]
        let payload = {checksum: 0, offset: 0, maxiumSize: 255, transfer: this.transfer}
        var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferPrepare, payload, mutations, dispatches, done)
        test.run()
      })
    })
    describe("content larger then object size", function() {
      let fileData
      beforeEach(function() {
        fileData = Array.from({length: 512}, () => Math.floor(Math.random() * 9))
        this.transfer.file = fileData
      })
      it('has one object to transfer', function(done) {
        let mutations = [
          {
            type: MutationTypes.UPDATE_TRANSFER,
            validation: function(payload) {
              expect(payload).to.deep.equal(this.transfer)
              expect(this.transfer.objects.length).to.equal(3);
            }.bind(this)
          }
        ]
        let dispatches = [
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(this.transfer)
            }.bind(this)
          },
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(this.transfer)
            }.bind(this)
          },
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(this.transfer)
            }.bind(this)
          },
          {
            type: 'webBluetoothDFUObjectValidate',
            validation: function (payload) {
              expect(payload.transferObject instanceof TransferObject).to.equal(true)
              expect(payload.checksum).to.not.be.undefined
              expect(payload.offset).to.not.be.undefined
            }
          }
        ]
        let payload = {checksum: 0, offset: 0, maxiumSize: 255, transfer: this.transfer}
        var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferPrepare, payload, mutations, dispatches, done)
        test.run()
      })
    })
  })

  describe('#webBluetoothDFUTransferNextObject', function () {
    beforeEach(function(done) {
      factory.buildMany('transferObject',2)
      .then((list) => {
        this.transfer.objects = list
        done()
      })
    })
    it('starts next transfer object', function(done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.transfer)
            expect(this.transfer.currentObjectIndex).to.equal(1);
          }.bind(this)
        }
      ]
      let dispatches = [
        {
          type: 'webBluetoothDFUObjectBegin',
          validation: function(payload) {
            expect(payload instanceof TransferObject).to.equal(true)
            expect(this.transfer.objects.indexOf(payload)).to.equal(1)
          }.bind(this)
        }
      ]
      this.transfer.currentObjectIndex = 0
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferNextObject, this.transfer, mutations, dispatches, done)
      test.run()
    })
    it('marks transfer complete if no more objects', function(done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(this.transfer)
            expect(this.transfer.state).to.equal(TransmissionStatus.Completed);
          }.bind(this)
        }
      ]
      this.transfer.currentObjectIndex = 1
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferNextObject, this.transfer, mutations, [], done)
      test.run()
    })

  })

  describe('#webBluetoothDFUTransferEventHandler', function () {

    describe('when state is Prepare', function() {
      SharedInvalidEventTests(TransmissionStatus.Prepare)
      it('prepares transfer when success verify', function(done) {
        let dispatches = [
          {
            type: 'webBluetoothDFUTransferPrepare',
            validation: function(payload) {
              expect(payload.transfer instanceof Transfer).to.equal(true)
              expect(payload.transfer).to.equal(this.transfer)
              expect(payload.checksum).to.equal(789)
              expect(payload.offset).to.equal(123456)
            }.bind(this)
          }
        ]
        this.transfer.state = TransmissionStatus.Prepare
        var eventData = new DataView(new ArrayBuffer(15))
        eventData.setUint8(0,Write.Actions.RESPONSE_CODE)
        eventData.setUint8(1,Write.Actions.SELECT)
        eventData.setUint8(2,Write.Responses.SUCCESS)
        eventData.setUint32(3, 4096, true)
        eventData.setUint32(7, 123456, true)
        eventData.setUint32(11, 789,true)
        var payload = {dataView: eventData, transfer: this.transfer}
        var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferEventHandler, payload, [], dispatches, done)
        test.run()
      })
    })

    describe('when state is Transfer', function() {
      SharedInvalidEventTests(TransmissionStatus.Transfering)
      SharedPassEventToTransferObject(TransmissionStatus.Transfering)
    })

    describe('when state is Completed', function() {
      SharedInvalidEventTests(TransmissionStatus.Completed)
      SharedPassEventToTransferObject(TransmissionStatus.Completed)
    })


    describe('when state is Failed', function() {
      SharedInvalidEventTests(TransmissionStatus.Failed)
      SharedPassEventToTransferObject(TransmissionStatus.Failed)
    })

  })

})
