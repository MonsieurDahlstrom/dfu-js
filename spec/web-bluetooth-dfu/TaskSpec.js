import factory from "factory-girl"
import {Task} from "../../src/dfu/Task"

describe("Task", function() {

  describe("#Worker", function() {

    it("error with null parameters", function () {
      this.executeAsyncMethod(async function() {
        expect(await Task.Worker(null,null)).toThrowError()
      })
    })

    it("error with null task", function() {
      this.executeAsyncMethod(async function() {
        var testCB = jasmine.createSpy('testCB')
        expect(await Task.Worker(null,testCB)).toThrowError("task is not of type Task")
      })
    })

    it("error with task not set to Task instance", function() {
      this.executeAsyncMethod(async function() {
        let callback = jasmine.createSpy('testCB')
        let task = {}
        expect(await Task.Worker(task,callback)).toThrowError("task is not of type Task")
      })
    })

    it("error without onCompleition", function() {
      this.executeAsyncMethod(async function() {
        var task = new Task()
        expect(await Task.Worker(task,null)).toThrowError("task is not of type Task")
      })
    })

  })
})
