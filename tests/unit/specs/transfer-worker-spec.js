import {expect} from 'chai'
import sinon from 'sinon'

import {Transfer, TransferWorker} from '../../../src/models/transfer'

describe('#TransferWorker', function () {

  it("runs with null parameters", function () {
    expect( function() {
      TransferWorker(null,null);
    }).to.throw()
  })

  it("error with null task", function() {
    var testCB = sinon.mock('testCB')
    expect( function() {
      TransferWorker(null,testCB);
    }).to.throw("task is not of type Task");
  })

  it("error with task not set to Task instance", function() {
    var testCB = sinon.mock('testCB')
    let task = {}
    expect( function() {
      TransferWorker(task,testCB);
    }).to.throw("task is not of type Task");
  })

  it("error without onCompleition", function() {
    var testTask = new Transfer()
    expect( function() {
      TransferWorker(testTask,null);
    }).to.throw("onCompleition is not set");
  })

})
