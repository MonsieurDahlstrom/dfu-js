import factory from "factory-girl"
import {Task} from "../../src/dfu/Task"

describe("Task", function() {

  describe("#Worker", function() {

    it("error with null parameters", function () {
      expect( function() {
        Task.Worker(null,null);
      }).toThrow()
    })

    it("error with null task", function() {
      var testCB = jasmine.createSpy('testCB')
      expect( function() {
        Task.Worker(null,testCB);
      }).toThrowError("task is not of type Task");
    })

    it("error with task not set to Task instance", function() {
      let callback = jasmine.createSpy('testCB')
      let task = {}
      expect( function() {
        Task.Worker(task,callback);
      }).toThrowError("task is not of type Task");
    })

    it("error without onCompleition", function() {
      var task = new Task()
      expect( function() {
        Task.Worker(task,null);
      }).toThrowError("onCompleition is not set");
    })

  })
})
