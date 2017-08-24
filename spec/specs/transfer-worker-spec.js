import {Transfer, TransferWorker} from '../../src/models/transfer'

describe('#TransferWorker', function () {

  it("runs with null parameters", function () {
    expect( function() {
      TransferWorker(null,null);
    }).toThrow()
  })

  it("error with null task", function() {
    var testCB = jasmine.createSpy('testCB')
    expect( function() {
      TransferWorker(null,testCB);
    }).toThrowError("task is not of type Task");
  })

  it("error with task not set to Task instance", function() {
    let testCB = jasmine.createSpy('testCB')
    let task = {}
    expect( function() {
      TransferWorker(task,testCB);
    }).toThrowError("task is not of type Task");
  })

  it("error without onCompleition", function() {
    var testTask = new Transfer()
    expect( function() {
      TransferWorker(testTask,null);
    }).toThrowError("onCompleition is not set");
  })

})
