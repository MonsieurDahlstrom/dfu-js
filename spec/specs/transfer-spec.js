import {Transfer,TransferStates,TransferTypes} from '../../src/models/transfer'
import {Task,TaskTypes,TaskResults} from '../../src/models/task'
import WebBluetoothCharacteristic from '../factories/WebBluetoothCharacteristicFactory';
import TransferFactory from '../factories/TransferFactory';
import factory from 'factory-girl';

describe('Transfer', function() {

  describe("#constructor", function() {


    describe('without parameters', function() {
      it("no exceptions", function() {
        expect( ()=> new Transfer()).not.toThrow()
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
      })
      it("no exceptions", function() {
        expect( ()=> new Transfer(dataset,controlPoint,packetPoint,transferObjectType)).not.toThrow()
      })
      it('should have data', function() {
        expect(transfer.file).toEqual(dataset)
      })
      it('should have data characteristic', function() {
        expect(transfer.packetPoint).toEqual(packetPoint)
      })
      it('should have control point characteristic', function() {
        expect(transfer.controlPoint).toEqual(controlPoint)
      })
      it('should have object type', function() {
        expect(transfer.objectType).toEqual(transferObjectType)
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
      expect(transfer.progress()).toBe(0.0)
    })
    it('1.0 when completed', function () {
      transfer.state = TransferStates.Completed
      expect(transfer.progress()).toBe(1.0)
    })
    it('1.0 when failed', function () {
      transfer.state = TransferStates.Failed
      expect(transfer.progress()).toBe(1.0)
    })
    it('in middle of transfering', function () {
      transfer.state = TransferStates.Transfer
      transfer.currentObjectIndex = 4
      transfer.objects = [5,2,3,4,{progress: function() { return 0.0}},7,8,9,10,10]
      expect(transfer.progress()).toBe(0.5)
    })
    it('start of transfer', function () {
      transfer.state = TransferStates.Transfer
      transfer.currentObjectIndex = 0
      transfer.objects = [{progress: function() { return 0.0}},2,3,4,5,7,8,9,10,10]
      expect(transfer.progress()).toBe(0.10)
    })
    it('end of transfer', function () {
      transfer.state = TransferStates.Transfer
      transfer.currentObjectIndex = 9
      transfer.objects = [5,2,3,4,5,7,8,9,10,{progress: function() { return 0.0}}]
      expect(transfer.progress()).toBe(0.98)
    })
  })

  describe("#addTask", function() {

    it("error when task is not of type Task", function() {
      let transfer = new Transfer()
      expect( function() {
        transfer.addTask(null);
      }).toThrowError("task is not of type Task");
    })

    it("task addded to queue", function() {
      let transfer = new Transfer()
      transfer.bleTasks.pause()
      let task = new Task()
      expect( function() {
        transfer.addTask(task);
      }).not.toThrow();
      expect(transfer.bleTasks.length()).toBe(1)
    })

    it("task is executed", function(done) {
      let transfer = new Transfer()
      let task = new Task()
      factory.build('WebBluetoothCharacteristic').then(characteristic => {
        task.characteristic = characteristic
        transfer.bleTasks.empty = function() {
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
        expect( function() { transfer.begin() }).not.toThrow()
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
        expect( function() { transfer.end() }).not.toThrow()
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
        }).not.toThrowError();
      })
      it('has one object to transfer', function() {
        transfer.prepareDFUObjects(255,0,0);
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
          transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferTypes.Command)
          done()
        })
      })
      it('does not throw error', function() {
        expect( () => {
          transfer.prepareDFUObjects(255,0,0);
        }).not.toThrowError();
      })
      it('has one object to transfer', function() {
        transfer.prepareDFUObjects(255,0,0);
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
          transfer = new Transfer(fileData, characteristics[0], characteristics[1], TransferTypes.Command)
          done()
        })
      })
      it('does not throw error', function() {
        expect( () => {
          transfer.prepareDFUObjects(255,0,0);
        }).not.toThrowError();
      })
      it('has one object to transfer', function() {
        transfer.prepareDFUObjects(255,0,0);
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

    describe('when state is Prepare', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = spyOn(console,'log');
        transfer.onEvent(event);
        expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
      })

      it('prepares transfer when success verify', function() {
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = spyOn(transfer,'prepareDFUObjects');
        transfer.onEvent(event);
        expect(transferSpy).toHaveBeenCalled();
      })
    })

    describe('when state is Transfer', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = spyOn(console,'log');
        transfer.state = TransferStates.Transfer
        transfer.onEvent(event);
        expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
      })

      it('prepares transfer when success verify', function() {
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = spyOn(transfer,'prepareDFUObjects');
        let eventHandlerSpy = jasmine.createSpyObj('TransferObject',['eventHandler'])
        transfer.objects = [eventHandlerSpy]
        transfer.currentObjectIndex = 0
        transfer.state = TransferStates.Transfer
        transfer.onEvent(event);
        expect(transferSpy).not.toHaveBeenCalled();
        expect(eventHandlerSpy.eventHandler).toHaveBeenCalledWith(selectSuccessResponse);
      })
    })

    describe('when state is Completed', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = spyOn(console,'log');
        transfer.state = TransferStates.Completed
        transfer.onEvent(event);
        expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
      })

      it('prepares transfer when success verify', function() {
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = spyOn(transfer,'prepareDFUObjects');
        let eventHandlerSpy = jasmine.createSpyObj('TransferObject',['eventHandler'])
        transfer.objects = [eventHandlerSpy]
        transfer.currentObjectIndex = 0
        transfer.state = TransferStates.Completed
        transfer.onEvent(event);
        expect(transferSpy).not.toHaveBeenCalled();
        expect(eventHandlerSpy.eventHandler).toHaveBeenCalledWith(selectSuccessResponse);
      })
    })

    describe('when state is Failed', function() {
      it('logs and handles none response codes', function() {
        let event = {target: {value: nonResponseResult}}
        let logSpy = spyOn(console,'log');
        transfer.state = TransferStates.Failed
        transfer.onEvent(event);
        expect(logSpy).toHaveBeenCalledWith('Transfer.onEvent() opcode was not a response code');
      })

      it('prepares transfer when success verify', function() {
        let event = {target: {value: selectSuccessResponse}}
        let transferSpy = spyOn(transfer,'prepareDFUObjects');
        let eventHandlerSpy = jasmine.createSpyObj('TransferObject',['eventHandler'])
        transfer.objects = [eventHandlerSpy]
        transfer.currentObjectIndex = 0
        transfer.state = TransferStates.Failed
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
      expect(transfer.state).toBe(TransferStates.Completed);
    })
  })

})
