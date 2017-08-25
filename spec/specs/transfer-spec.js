import {expect} from 'chai'
import sinon from 'sinon'

import {Transfer,TransferStates,TransferTypes} from '../../src/models/transfer'
import {Task,TaskTypes,TaskResults} from '../../src/models/task'
import {DFUObject} from '../../src/models/dfu-object'

import factory from '../factories';

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
        factory.buildMany("WebBluetoothCharacteristic",2)
        .then(result => {
          packetPoint = result[0]
          controlPoint = result[1]
          transfer = new Transfer(dataset,controlPoint,packetPoint,transferObjectType)
          done()
        })
        .catch(err => {
          done(err)
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
        expect(transfer.type).to.equal(transferObjectType)
      })
    })
  })

  describe("#progress", function () {
    let dataset
    let packetPoint
    let controlPoint
    let transferObjectType
    let transfer
    beforeEach(function(done) {
      dataset = Array.from({length: 254}, () => Math.floor(Math.random() * 9));
      transferObjectType = (Math.random() <= 0.5) === true ? 1 : 2;
      factory.buildMany("WebBluetoothCharacteristic",2)
      .then(result => {
        packetPoint = result[0]
        controlPoint = result[1]
        transfer = new Transfer(dataset,controlPoint,packetPoint,transferObjectType)
        done()
      })
    })
    it('0.0 when preparing', function () {
      transfer.state = TransferStates.Prepare
      transfer.calculateProgress()
      expect(transfer.progress).to.equal(0.0)
    })
    it('1.0 when completed', function () {
      transfer.state = TransferStates.Completed
      transfer.calculateProgress()
      expect(transfer.progress).to.equal(1.0)
    })
    it('1.0 when failed', function () {
      transfer.state = TransferStates.Failed
      transfer.calculateProgress()
      expect(transfer.progress).to.equal(1.0)
    })
    it('in middle of transfering', function () {
      transfer.state = TransferStates.Transfer
      transfer.currentObjectIndex = 4
      transfer.objects = [5,2,3,4,{progress: function() { return 0.0}},7,8,9,10,10]
      transfer.calculateProgress()
      expect(transfer.progress).to.equal(0.5)
    })
    it('start of transfer', function () {
      transfer.state = TransferStates.Transfer
      transfer.currentObjectIndex = 0
      transfer.objects = [{progress: function() { return 0.0}},2,3,4,5,7,8,9,10,10]
      transfer.calculateProgress()
      expect(transfer.progress).to.equal(0.10)
    })
    it('end of transfer', function () {
      transfer.state = TransferStates.Transfer
      transfer.currentObjectIndex = 9
      transfer.objects = [5,2,3,4,5,7,8,9,10,{progress: function() { return 0.0}}]
      transfer.calculateProgress()
      expect(transfer.progress).to.equal(0.98)
    })
  })

  describe("#addTask", function() {

    it("error when task is not of type Task", function() {
      let transfer = new Transfer()
      expect( function() {
        transfer.addTask(null);
      }).to.throw("task is not of type Task");
    })

    it("task addded to queue", function() {
      let transfer = new Transfer()
      transfer.tasks.pause()
      let task = new Task()
      expect( function() {
        transfer.addTask(task);
      }).to.not.throw();
      expect(transfer.tasks.length()).to.equal(1)
    })

    it("task is executed", function(done) {
      let transfer = new Transfer()
      let task = new Task()
      factory.build('WebBluetoothCharacteristic').then(characteristic => {
        task.characteristic = characteristic
        transfer.tasks.empty = function() {
          done();
        }
        transfer.addTask(task);
      })
    })

  })

  describe("#begin", function() {

    it("does not throw", function(done) {
      factory.build("WebBluetoothCharacteristic")
      .then(characteristic => {
        let transfer = new Transfer()
        transfer.controlPoint = characteristic
        expect( function() { transfer.begin() }).to.not.throw()
        done()
      })
    })

  })

  describe("#end", function() {
    it("does not throw", function(done) {
      factory.build("WebBluetoothCharacteristic")
      .then(characteristic => {
        let transfer = new Transfer()
        transfer.controlPoint = characteristic
        expect( function() { transfer.end() }).to.not.throw()
        done()
      })
    })
  })

  describe("#prepareDFUObjects", function() {

    describe("file size smaller then maximum object size", function() {
      let fileData
      let transfer
      beforeEach(function(done) {
        fileData = Array.from({length: 29}, () => Math.floor(Math.random() * 9));
        factory.buildMany('WebBluetoothCharacteristic',2)
        .then(characteristics => {
          transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferTypes.Command)
          done()
        })
      })
      it('does not throw error', function() {
        expect( () => {
          transfer.prepareDFUObjects(255,0,0);
        }).not.to.throw();
      })
      it('has one object to transfer', function() {
        transfer.prepareDFUObjects(255,0,0);
        expect(transfer.objects.length).to.equal(1);
      })
    })

    describe("content length equal to object size", function() {
      let fileData
      let transfer
      beforeEach(function(done) {
        fileData = Array.from({length: 255}, () => Math.floor(Math.random() * 9));
        factory.buildMany('WebBluetoothCharacteristic',2)
        .then(characteristics => {
          transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferTypes.Command)
          done()
        })
      })
      it('does not throw error', function() {
        expect( () => {
          transfer.prepareDFUObjects(255,0,0);
        }).not.to.throw();
      })
      it('has one object to transfer', function() {
        transfer.prepareDFUObjects(255,0,0);
        expect(transfer.objects.length).to.equal(1);
      })
    })

    describe("content length larger then object size", function() {
      let fileData
      let transfer
      beforeEach(function(done) {
        fileData = Array.from({length: 512}, () => Math.floor(Math.random() * 9));
        factory.buildMany('WebBluetoothCharacteristic',2)
        .then(characteristics => {
          transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferTypes.Command)
          done()
        })
      })
      it('does not throw error', function() {
        expect( () => {
          transfer.prepareDFUObjects(255,0,0);
        }).not.to.throw();
      })
      it('has one object to transfer', function() {
        transfer.prepareDFUObjects(255,0,0);
        expect(transfer.objects.length).to.equal(3);
      })
    })

  })

  describe("#onEvent", function() {

    let selectSuccessResponse
    let nonResponseResult
    let transfer
    let sandbox
    before(function() {
      sandbox = sinon.sandbox.create()
      nonResponseResult = new DataView(new ArrayBuffer(2));
      nonResponseResult.setUint8(0, TaskTypes.SET_PRN);
      nonResponseResult.setUint8(1, TaskResults.INVALID_OBJECT);
      //
      selectSuccessResponse = new DataView(new ArrayBuffer(15));
      selectSuccessResponse.setUint8(0, TaskTypes.RESPONSE_CODE);
      selectSuccessResponse.setUint8(1, TaskTypes.SELECT);
      selectSuccessResponse.setUint8(2, TaskResults.SUCCESS);
      selectSuccessResponse.setInt32(3, 0, true);
      selectSuccessResponse.setInt32(7, 0, true);
      selectSuccessResponse.setInt32(11, 0, true);

    })
    beforeEach(function() {
      transfer = new Transfer()
    })
    afterEach(function () {
      sandbox.restore()
    })

    describe('when state is Prepare', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = sandbox.spy(console,'log')
        transfer.onEvent(event)
        sandbox.restore
        expect(logSpy.firstCall.args).to.deep.equal(['Transfer.onEvent() opcode was not a response code'])
      })

      it('prepares transfer when success verify', function() {
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = sandbox.stub(transfer,'prepareDFUObjects');
        transfer.onEvent(event);
        expect(transferSpy.calledOnce).to.be.true;
      })
    })

    describe('when state is Transfer', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = sandbox.spy(console,'log');
        transfer.state = TransferStates.Transfer
        transfer.onEvent(event);
        expect(logSpy.firstCall.args).to.deep.equal(['Transfer.onEvent() opcode was not a response code'])
      })

      it('prepares transfer when success verify', function() {
        let dfuObject = new DFUObject()
        let dfuObjectMock = sandbox.stub(dfuObject,'eventHandler')
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = sandbox.spy(transfer,'prepareDFUObjects');
        transfer.objects = [dfuObject]
        transfer.currentObjectIndex = 0
        transfer.state = TransferStates.Transfer
        transfer.onEvent(event);
        expect(transferSpy.calledOnce).not.be.true
        expect(dfuObjectMock.calledOnce).to.be.true
        expect(dfuObjectMock.firstCall.args).to.deep.equal([selectSuccessResponse]);
      })
    })

    describe('when state is Completed', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = sandbox.spy(console,'log');
        transfer.state = TransferStates.Completed
        transfer.onEvent(event);
        expect(logSpy.firstCall.args).to.deep.equal(['Transfer.onEvent() opcode was not a response code'])
      })

      it('prepares transfer when success verify', function() {
        let dfuObject = new DFUObject()
        let dfuObjectMock = sandbox.stub(dfuObject,'eventHandler')
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = sandbox.spy(transfer,'prepareDFUObjects');
        transfer.objects = [dfuObject]
        transfer.currentObjectIndex = 0
        transfer.state = TransferStates.Completed
        transfer.onEvent(event);
        expect(transferSpy.notCalled).to.be.true
        expect(dfuObjectMock.firstCall.args).to.deep.equal([selectSuccessResponse]);
      })
    })

    describe('when state is Failed', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = sandbox.spy(console,'log');
        transfer.state = TransferStates.Failed
        transfer.onEvent(event);
        expect(logSpy.firstCall.args).to.deep.equal(['Transfer.onEvent() opcode was not a response code'])
      })

      it('prepares transfer when success verify', function() {
        let dfuObject = new DFUObject()
        let dfuObjectMock = sandbox.stub(dfuObject,'eventHandler')
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = sandbox.spy(transfer,'prepareDFUObjects');
        transfer.objects = [dfuObject]
        transfer.currentObjectIndex = 0
        transfer.state = TransferStates.Failed
        transfer.onEvent(event);
        expect(transferSpy.notCalled).to.be.true
        expect(dfuObjectMock.firstCall.args).to.deep.equal([selectSuccessResponse]);
      })
    })

  })

  describe("#nextObject", function() {
    let transfer
    let sandbox
    beforeEach(function() {
      sandbox = sinon.sandbox.create()
      transfer = new Transfer()
    })
    it('startsx next transfer object', function() {
      let dfuObject = new DFUObject()
      let dfuObjectMock = sandbox.mock(dfuObject)
      dfuObjectMock.expects("begin").once()
      transfer.objects = [dfuObject,dfuObject]
      transfer.currentObjectIndex = 0
      expect( () => {
        transfer.nextObject()
      }).to.not.throw()
      dfuObjectMock.verify()
      expect(transfer.currentObjectIndex).to.equal(1);
    })
    it('marks transfer complete if no more objects', function() {
      let dfuObject = new DFUObject()
      let dfuObjectMock = sandbox.mock(dfuObject)
      transfer.objects = [dfuObject]
      transfer.currentObjectIndex = 0
      expect( () => {
        transfer.nextObject()
      }).to.not.throw()
      expect(transfer.state).to.equal(TransferStates.Completed);
    })
  })

})
