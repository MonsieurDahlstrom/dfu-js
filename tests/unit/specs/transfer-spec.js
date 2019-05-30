import {expect} from 'chai'
import sinon from 'sinon'

import {Transfer,TransferStates,TransferTypes} from '../../../src/models/transfer'
import {DFUObject, DFUObjectStates} from '../../../src/models/dfu-object'
import {Task,TaskTypes,TaskResults} from '../../../src/models/task'

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
        factory.buildMany("webBluetoothCharacteristic",2)
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
    beforeEach(function(done) {
      factory.create("transfer")
      .then(transfer => {
        this.transfer = transfer
        done()
      })
    })
    it('0.0 when preparing', function () {
      this.transfer.state = TransferStates.Prepare
      this.transfer.checkProgress()
      expect(this.transfer.progress).to.equal(0.0)
    })
    it('1.0 when completed', function () {
      this.transfer.state = TransferStates.Completed
      this.transfer.checkProgress()
      expect(this.transfer.progress).to.equal(1.0)
    })
    it('1.0 when failed', function () {
      this.transfer.state = TransferStates.Failed
      this.transfer.checkProgress()
      expect(this.transfer.progress).to.equal(1.0)
    })
    it('in middle of transfering', function (done) {
      factory.buildMany('dfuObject',4)
      .then(objectList => {
        this.transfer.state = TransferStates.Transfer
        this.transfer.objects = objectList
        this.transfer.objects[0].state = DFUObjectStates.Completed
        this.transfer.objects[1].state = DFUObjectStates.Transfering
        this.transfer.objects[2].state = DFUObjectStates.NotStarted
        this.transfer.objects[3].state = DFUObjectStates.NotStarted
        this.transfer.objects[1].progress.completed = 64
        this.transfer.checkProgress()
        expect(this.transfer.progress).to.equal(0.375)
        done()
      })
      .catch(err => done(err))
    })
    it('start transfering', function (done) {
      factory.buildMany('dfuObject',4)
      .then(objectList => {
        this.transfer.state = TransferStates.Transfer
        this.transfer.objects = objectList
        this.transfer.objects[0].progress.completed = 40
        this.transfer.objects[0].state = DFUObjectStates.Transfering
        this.transfer.objects[1].state = DFUObjectStates.NotStarted
        this.transfer.objects[2].state = DFUObjectStates.NotStarted
        this.transfer.objects[3].state = DFUObjectStates.NotStarted
        this.transfer.checkProgress()
        expect(this.transfer.progress).to.equal(0.078125)
        done()
      })
      .catch(err => done(err))
    })
    it('just finished transfering', function (done) {
      factory.buildMany('dfuObject',4)
      .then(objectList => {
        this.transfer.state = TransferStates.Transfer
        this.transfer.objects = objectList
        this.transfer.objects[0].state = DFUObjectStates.Completed
        this.transfer.objects[1].state = DFUObjectStates.Completed
        this.transfer.objects[2].state = DFUObjectStates.Completed
        this.transfer.objects[3].state = DFUObjectStates.Completed
        this.transfer.checkProgress()
        expect(this.transfer.progress).to.equal(1.0)
        done()
      })
      .catch(err => done(err))
    })
    it('just finished with an error', function (done) {
      factory.buildMany('dfuObject',4)
      .then(objectList => {
        this.transfer.state = TransferStates.Transfer
        this.transfer.objects = objectList
        this.transfer.objects[0].state = DFUObjectStates.Completed
        this.transfer.objects[1].state = DFUObjectStates.Completed
        this.transfer.objects[2].state = DFUObjectStates.Completed
        this.transfer.objects[3].state = DFUObjectStates.Failed
        this.transfer.checkProgress()
        expect(this.transfer.progress).to.equal(1.0)
        done()
      })
      .catch(err => done(err))
    })
  })

  describe("#begin", function() {

    it("does not throw", function(done) {
      factory.build("webBluetoothCharacteristic")
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
      factory.build("webBluetoothCharacteristic")
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
        factory.buildMany('webBluetoothCharacteristic',2)
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
        factory.buildMany('webBluetoothCharacteristic',2)
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
        factory.buildMany('webBluetoothCharacteristic',2)
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
      sandbox = sinon.createSandbox()
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
        let logSpy = sandbox.spy(console,'warn')
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
        let logSpy = sandbox.spy(console,'warn');
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
        let logSpy = sandbox.spy(console,'warn');
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
        let logSpy = sandbox.spy(console,'warn');
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
      sandbox = sinon.createSandbox()
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
