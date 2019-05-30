import {expect} from 'chai'
import sinon from 'sinon'
//
import factory from "factory-girl"
import {Task} from "../../../src/models/task"

describe("Task", function() {

  describe("#Worker", function() {

    it("error with null parameters", function (done) {
      Task.Worker(null,null)
      .then(() => {
        done('Task.Worker should not complete')
      })
      .catch(err => {
        done()
      })
    })

    it("error with null task", function(done) {
      let testCB = sinon.mock('Task')
      Task.Worker(null,testCB)
      .then(() => {
        done('Task.Worker should not complete')
      })
      .catch(err => {
        done()
      })
    })

    it("error with task not set to Task instance", function(done) {
      let callback = sinon.mock('testCB')
      let task = {}
      Task.Worker(task,callback)
      .then(() => {
        done('Task.Worker should not complete')
      })
      .catch(err => {
        done()
      })
    })

    it("error without onCompleition", function(done) {
      var task = new Task()
      Task.Worker(task,null)
      .then(() => {
        done('Task.Worker should not complete')
      })
      .catch(err => {
        done()
      })
    })

  })
})
