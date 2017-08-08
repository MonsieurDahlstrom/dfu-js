import sinon from 'sinon'
import {expect} from 'chai'
import crc from 'crc'
//
import VuexActionTester from '../../helpers/vuex-action-tester'
import factory from '../../factories'
//
import {Verify,Validate} from '../../../src/types/write'
import * as MutationTypes from '../../../src/mutation-types'
import TransferActions from '../../../src/actions/transfer-actions'
import {TransferObject} from '../../../src/types/transfer-object'
import TransmissionStatus from '../../../src/types/transmission-types'

describe('Transfer Actions', function () {

  let sandbox
  let transfer
  let state
  beforeEach(function (done) {
    sandbox = sinon.sandbox.create()
    state = {writes: [], objects: []}
    factory.create('transfer')
    .then((newTransfer) => {
      transfer = newTransfer
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe('#webBluetoothDFUTransferAdd', function () {
    it('create callback', function (done) {
      let mutations = [
        {
          type: MutationTypes.ADD_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(transfer);
            expect(payload.controlPointEventHandler).to.be.an('function')
            return true
          }
        }
      ]
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferAdd, transfer, mutations,[], done)
      test.run()
    })
  })

  describe('#webBluetoothDFUTransferRemove', function () {
    it('removes callback', function (done) {
      let mutations = [
        {
          type: MutationTypes.REMOVE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(transfer);
            expect(payload.controlPointEventHandler).to.be.undefined
            return true
          }
        }
      ]
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferRemove, transfer, mutations,[], done)
      test.run()
    })
  })

  describe("#webBluetoothDFUTransferBegin", function() {
    it("does not throw", function(done) {
      let mutations = [
        { type: MutationTypes.UPDATE_TRANSFER, validation: function(payload) { expect(payload).to.deep.equal(transfer); return true}}
      ]
      let dispatches = [
        { type: 'webBluetoothDFUScheduleWrite', validation: function(payload) { expect(payload instanceof Verify).to.equal(true); return true}},
        { type: 'webBluetoothDFUExecuteWrite', validation: function(payload) { expect(payload instanceof Verify).to.equal(true); return true}}

      ]
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferBegin, transfer, mutations, dispatches, done)
      test.run()
    })
  })

  describe('#webBluetoothDFUTransferPrepare', function () {
    describe("file size smaller then maximum object size", function() {
      let fileData
      beforeEach(function() {
        fileData = Array.from({length: 29}, () => Math.floor(Math.random() * 9))
        transfer.file = fileData
      })
      it('has one object to transfer', function(done) {
        let mutations = [
          {
            type: MutationTypes.UPDATE_TRANSFER,
            validation: function(payload) {
              expect(payload).to.deep.equal(transfer)
              expect(transfer.objects.length).to.equal(1);
              return true
            }
          }
        ]
        let dispatches = [
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(transfer)
              return true
            }
          },
          {
            type: 'webBluetoothDFUObjectValidate',
            validation: function (payload) {
              expect(payload.transferObject instanceof TransferObject).to.equal(true)
              expect(payload.checksum).to.not.be.undefined
              expect(payload.offset).to.not.be.undefined
              return true
            }
          }
        ]
        let payload = {checksum: 0, offset: 0, maxiumSize: 255, transfer: transfer}
        var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferPrepare, payload, mutations, dispatches, done)
        test.run()
      })
    })
    describe("content length equal to object size", function() {
      let fileData
      beforeEach(function() {
        fileData = Array.from({length: 255}, () => Math.floor(Math.random() * 9))
        transfer.file = fileData
      })
      it('has one object to transfer', function(done) {
        let mutations = [
          {
            type: MutationTypes.UPDATE_TRANSFER,
            validation: function(payload) {
              expect(payload).to.deep.equal(transfer)
              expect(transfer.objects.length).to.equal(1);
              return true
            }
          }
        ]
        let dispatches = [
          {
            type: 'webBluetoothDFUObjectAdd',
            validation: function(payload) {
              expect(payload instanceof TransferObject).to.equal(true)
              expect(payload.transfer).to.equal(transfer)
              return true
            }
          },
          {
            type: 'webBluetoothDFUObjectValidate',
            validation: function (payload) {
              expect(payload.transferObject instanceof TransferObject).to.equal(true)
              expect(payload.checksum).to.not.be.undefined
              expect(payload.offset).to.not.be.undefined
              return true
            }
          }
        ]
        let payload = {checksum: 0, offset: 0, maxiumSize: 255, transfer: transfer}
        var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferPrepare, payload, mutations, dispatches, done)
        test.run()
      })
      describe("content larger then object size", function() {
        let fileData
        beforeEach(function() {
          fileData = Array.from({length: 512}, () => Math.floor(Math.random() * 9))
          transfer.file = fileData
        })
        it('has one object to transfer', function(done) {
          let mutations = [
            {
              type: MutationTypes.UPDATE_TRANSFER,
              validation: function(payload) {
                expect(payload).to.deep.equal(transfer)
                expect(transfer.objects.length).to.equal(3);
                return true
              }
            }
          ]
          let dispatches = [
            {
              type: 'webBluetoothDFUObjectAdd',
              validation: function(payload) {
                expect(payload instanceof TransferObject).to.equal(true)
                expect(payload.transfer).to.equal(transfer)
                return true
              }
            },
            {
              type: 'webBluetoothDFUObjectAdd',
              validation: function(payload) {
                expect(payload instanceof TransferObject).to.equal(true)
                expect(payload.transfer).to.equal(transfer)
                return true
              }
            },
            {
              type: 'webBluetoothDFUObjectAdd',
              validation: function(payload) {
                expect(payload instanceof TransferObject).to.equal(true)
                expect(payload.transfer).to.equal(transfer)
                return true
              }
            },
            {
              type: 'webBluetoothDFUObjectValidate',
              validation: function (payload) {
                expect(payload.transferObject instanceof TransferObject).to.equal(true)
                expect(payload.checksum).to.not.be.undefined
                expect(payload.offset).to.not.be.undefined
                return true
              }
            }
          ]
          let payload = {checksum: 0, offset: 0, maxiumSize: 255, transfer: transfer}
          var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferPrepare, payload, mutations, dispatches, done)
          test.run()
        })
      })
    })
  })

  describe('#webBluetoothDFUTransferNextObject', function () {
    beforeEach(function(done) {
      factory.buildMany('transferObject',2)
      .then((list) => {
        transfer.objects = list
        done()
      })
    })
    it('startsx next transfer object', function(done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(transfer)
            expect(transfer.currentObjectIndex).to.equal(1);
            return true
          }
        }
      ]
      let dispatches = [
        {
          type: 'webBluetoothDFUObjectBegin',
          validation: function(payload) {
            expect(payload instanceof TransferObject).to.equal(true)
            expect(transfer.objects.indexOf(payload)).to.equal(1)
            return true
          }
        }
      ]
      transfer.currentObjectIndex = 0
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferNextObject, transfer, mutations, dispatches, done)
      test.run()
    })
    it('marks transfer complete if no more objects', function(done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_TRANSFER,
          validation: function(payload) {
            expect(payload).to.deep.equal(transfer)
            expect(transfer.state).to.equal(TransmissionStatus.Completed);
            return true
          }
        }
      ]
      transfer.currentObjectIndex = 1
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferNextObject, transfer, mutations, [], done)
      test.run()
    })

  })

  describe('#webBluetoothDFUTransferEventHandler', function () {})

})

/*
describe("#end", function() {
  it("does not throw", function(done) {
    factory.build("WebBluetoothCharacteristic")
    .then(characteristic => {
      let transfer = new Transfer()
      transfer.controlPoint = characteristic
      expect( function() { transfer.end() }).not.toThrow()
      done()
    })
  })
})

describe("#onEvent", function() {

  let selectSuccessResponse
  let nonResponseResult
  let transfer
  beforeAll(function() {
    nonResponseResult = new DataView(new ArrayBuffer(2));
    nonResponseResult.setUint8(0, TaskType.SET_PRN);
    nonResponseResult.setUint8(1, TaskResult.INVALID_OBJECT);
    //
    selectSuccessResponse = new DataView(new ArrayBuffer(15));
    selectSuccessResponse.setUint8(0, TaskType.RESPONSE_CODE);
    selectSuccessResponse.setUint8(1, TaskType.SELECT);
    selectSuccessResponse.setUint8(2, TaskResult.SUCCESS);
    selectSuccessResponse.setInt32(3, 0, true);
    selectSuccessResponse.setInt32(7, 0, true);
    selectSuccessResponse.setInt32(11, 0, true);

  })

  beforeEach(function() {
    transfer = new Transfer()
  })

  describe('when state is Prepare', function() {
    it('logs and handles none response codes', function() {
      let event = {target: {value: nonResponseResult}}
      let logSpy = spyOn(console,'log');
      transfer.onEvent(event);
      expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
    })

    it('prepares transfer when success verify', function() {
      let event = {target: {value: selectSuccessResponse}}
      let transferSpy = spyOn(transfer,'prepareTransferObjects');
      transfer.onEvent(event);
      expect(transferSpy).toHaveBeenCalled();
    })
  })

  describe('when state is Transfer', function() {
    it('logs and handles none response codes', function() {
      let event = {target: {value: nonResponseResult}}
      let logSpy = spyOn(console,'log');
      transfer.state = TransferState.Transfer
      transfer.onEvent(event);
      expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
    })

    it('prepares transfer when success verify', function() {
      let event = {target: {value: selectSuccessResponse}}
      let transferSpy = spyOn(transfer,'prepareTransferObjects');
      let eventHandlerSpy = jasmine.createSpyObj('TransferObject',['eventHandler'])
      transfer.objects = [eventHandlerSpy]
      transfer.currentObjectIndex = 0
      transfer.state = TransferState.Transfer
      transfer.onEvent(event);
      expect(transferSpy).not.toHaveBeenCalled();
      expect(eventHandlerSpy.eventHandler).toHaveBeenCalledWith(selectSuccessResponse);
    })
  })

  describe('when state is Completed', function() {
    it('logs and handles none response codes', function() {
      let event = {target: {value: nonResponseResult}}
      let logSpy = spyOn(console,'log');
      transfer.state = TransferState.Completed
      transfer.onEvent(event);
      expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
    })

    it('prepares transfer when success verify', function() {
      let event = {target: {value: selectSuccessResponse}}
      let transferSpy = spyOn(transfer,'prepareTransferObjects');
      let eventHandlerSpy = jasmine.createSpyObj('TransferObject',['eventHandler'])
      transfer.objects = [eventHandlerSpy]
      transfer.currentObjectIndex = 0
      transfer.state = TransferState.Completed
      transfer.onEvent(event);
      expect(transferSpy).not.toHaveBeenCalled();
      expect(eventHandlerSpy.eventHandler).toHaveBeenCalledWith(selectSuccessResponse);
    })
  })

  describe('when state is Failed', function() {
    it('logs and handles none response codes', function() {
      let event = {target: {value: nonResponseResult}}
      let logSpy = spyOn(console,'log');
      transfer.state = TransferState.Failed
      transfer.onEvent(event);
      expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
    })

    it('prepares transfer when success verify', function() {
      let event = {target: {value: selectSuccessResponse}}
      let transferSpy = spyOn(transfer,'prepareTransferObjects');
      let eventHandlerSpy = jasmine.createSpyObj('TransferObject',['eventHandler'])
      transfer.objects = [eventHandlerSpy]
      transfer.currentObjectIndex = 0
      transfer.state = TransferState.Failed
      transfer.onEvent(event);
      expect(transferSpy).not.toHaveBeenCalled();
      expect(eventHandlerSpy.eventHandler).toHaveBeenCalledWith(selectSuccessResponse);
    })
  })

})

describe("#nextObject", function() {
  let transfer
  beforeEach(function() {
    transfer = new Transfer()
  })
  it('startsx next transfer object', function() {
    let transferObjectSpy = jasmine.createSpyObj('TransferObject',['begin'])
    transfer.objects = [transferObjectSpy,transferObjectSpy]
    transfer.currentObjectIndex = 0
    expect( () => {
      transfer.nextObject()
    }).not.toThrow()
    expect(transferObjectSpy.begin).toHaveBeenCalled();
    expect(transfer.currentObjectIndex).toBe(1);
  })
  it('marks transfer complete if no more objects', function() {
    let transferObjectSpy = jasmine.createSpyObj('TransferObject',['begin'])
    transfer.objects = [transferObjectSpy]
    transfer.currentObjectIndex = 0
    expect( () => {
      transfer.nextObject()
    }).not.toThrow()
    expect(transfer.state).toBe(TransferState.Completed);
  })
})
*/
