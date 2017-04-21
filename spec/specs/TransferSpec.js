import {Transfer,TransferState, TransferObjectType} from '../../src/dfu'
import {Task,TaskType, TaskResult} from '../../src/dfu/Task'
import WebBluetoothCharacteristic from '../factories/WebBluetoothCharacteristicFactory';
import TransferFactory from '../factories/TransferFactory';
import factory from 'factory-girl';

describe('Transfer', function() {

  describe("#Worker", function() {

    it("runs with null parameters", function () {
      expect( function() {
        Transfer.Worker(null,null);
      }).toThrow()
    })

    it("error with null task", function() {
      var testCB = jasmine.createSpy('testCB')
      expect( function() {
        Transfer.Worker(null,testCB);
      }).toThrowError("task is not of type Task");
    })

    it("error with task not set to Task instance", function() {
      let testCB = jasmine.createSpy('testCB')
      let task = {}
      expect( function() {
        Transfer.Worker(task,testCB);
      }).toThrowError("task is not of type Task");
    })

    it("error without onCompleition", function() {
      var testTask = new Transfer()
      expect( function() {
        Transfer.Worker(testTask,null);
      }).toThrowError("onCompleition is not set");
    })

  })

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

})
