import {Transfer,TransferState, TransferObjectType} from '../../src/dfu'
import {Task,TaskType} from '../../src/dfu/Task'
import WebBluetoothCharacteristic from '../factories/WebBluetoothCharacteristicFactory';
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
      var testTask = new Task()
      expect( function() {
        Transfer.Worker(testTask,null);
      }).toThrowError("onCompleition is not set");
    })

  })

  describe("#constructor", function() {

    it("empty paramter list", function() {
      expect(new Transfer()).toBeTruthy()
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
      transfer.bleTasks.empty = function() {
        expect(transfer.bleTasks.length()).toBe(0)
        done();
      }
      transfer.addTask(task);
    })

  })

  describe("#begin", function() {

    it("does not throw", function(done) {
      factory.build("WebBluetoothCharacteristic")
      .then(characteristic => {
        let transfer = new Transfer()
        transfer.controlPoint = characteristic
        console.log(characteristic.writeValue());
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

  describe("Pending #prepareTransferObjects", function() {})

  describe("Pending #onEvent", function() {})

  describe("Pending #nextObject", function() {})

})
