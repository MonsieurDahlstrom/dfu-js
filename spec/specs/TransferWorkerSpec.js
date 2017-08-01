import {Transfer,TransferWorker, TransferState, TransferObjectType} from '../../src/dfu'

describe('TransferWorker', function () {

  describe('constructor', function () {
    it('does not throw', function () {
      expect(() => {var worker = new TransferWorker()}).not.toThrow()
    })
  })
  describe("#Worker", function() {
    let transferWorker
    beforeEach(function () {
      transferWorker = new TransferWorker()
    })
    it("runs with null parameters", function () {
      expect( function() {
        transferWorker.work(null,null);
      }).toThrow()
    })

    it("error with null task", function() {
      var testCB = jasmine.createSpy('testCB')
      expect( function() {
        transferWorker.work(null,testCB);
      }).toThrowError("task is not of type Task");
    })

    it("error with task not set to Task instance", function() {
      let testCB = jasmine.createSpy('testCB')
      let task = {}
      expect( function() {
        transferWorker.work(task,testCB);
      }).toThrowError("task is not of type Task");
    })

    it("error without onCompleition", function() {
      var testTask = new Transfer()
      expect( function() {
        console.log(transferWorker)
        transferWorker.work(testTask,null);
      }).toThrowError("onCompleition is not set");
    })

  })

})
