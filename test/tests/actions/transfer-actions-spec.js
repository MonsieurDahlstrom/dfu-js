import sinon from 'sinon'
import {expect} from 'chai'
import crc from 'crc'
//
import VuexActionTester from '../../helpers/vuex-action-tester'
import factory from '../../factories'
//
import {Verify} from '../../../src/types/write'
import * as MutationTypes from '../../../src/mutation-types'
import TransferActions from '../../../src/actions/transfer-actions'

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
    it('create callback', function (done) {
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
      var test = new VuexActionTester(TransferActions.webBluetoothDFUTransferBegin, transfer, mutations,dispatches, done)
      test.run()
    })
  })

  describe('#webBluetoothDFUTransferPrepare', function () {})

  describe('#webBluetoothDFUTransferNextObject', function () {})

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

describe("#prepareTransferObjects", function() {

  describe("file size smaller then maximum object size", function() {
    let fileData
    let transfer
    beforeEach(function(done) {
      fileData = Array.from({length: 29}, () => Math.floor(Math.random() * 9));
      factory.buildMany('WebBluetoothCharacteristic',2)
      .then(characteristics => {
        transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferObjectType.Command)
        done()
      })
    })
    it('does not throw error', function() {
      expect( () => {
        transfer.prepareTransferObjects(255,0,0);
      }).not.toThrowError();
    })
    it('has one object to transfer', function() {
      transfer.prepareTransferObjects(255,0,0);
      expect(transfer.objects.length).toBe(1);
    })
  })

  describe("content length equal to object size", function() {
    let fileData
    let transfer
    beforeEach(function(done) {
      fileData = Array.from({length: 255}, () => Math.floor(Math.random() * 9));
      factory.buildMany('WebBluetoothCharacteristic',2)
      .then(characteristics => {
        transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferObjectType.Command)
        done()
      })
    })
    it('does not throw error', function() {
      expect( () => {
        transfer.prepareTransferObjects(255,0,0);
      }).not.toThrowError();
    })
    it('has one object to transfer', function() {
      transfer.prepareTransferObjects(255,0,0);
      expect(transfer.objects.length).toBe(1);
    })
  })

  describe("content length larger then object size", function() {
    let fileData
    let transfer
    beforeEach(function(done) {
      fileData = Array.from({length: 512}, () => Math.floor(Math.random() * 9));
      factory.buildMany('WebBluetoothCharacteristic',2)
      .then(characteristics => {
        transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferObjectType.Command)
        done()
      })
    })
    it('does not throw error', function() {
      expect( () => {
        transfer.prepareTransferObjects(255,0,0);
      }).not.toThrowError();
    })
    it('has one object to transfer', function() {
      transfer.prepareTransferObjects(255,0,0);
      expect(transfer.objects.length).toBe(3);
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
