import factory from 'factory-girl'
import WriteFactories from '../../factories/write-factory'
import WriteActions from "../../../src/actions/write-actions"
import WriteMutations from '../../../src/mutations/write-mutations'
import * as MutationTypes from '../../../src/mutation-types'
import VuexActionTester from '../../helpers/web-bluetooth-dfu/vuex-action-tester'
// import * as Write from './../../src/types/write'

describe('Write Actions', function () {

  describe('webBluetoothDFUScheduleWrite', function() {
    let write
    beforeEach(function(done) {
      factory.build('writeChecksum')
      .then((checksum) => {
        write = checksum
        done()
      })
    })
    it('accepts Write object', function (done) {
      let mutations = [{ type: MutationTypes.ADD_WRITE, payload: write }]
      var states = {writes: []}
      var test = new VuexActionTester(WriteActions.webBluetoothDFUScheduleWrite, write, states, mutations, done)
      test.run(0)
    })
  })
  describe('webBluetoothDFURemoveWrite', function () {
    let write
    beforeEach(function(done) {
      factory.build('writeChecksum')
      .then((checksum) => {
        write = checksum
        done()
      })
    })
    it('accepts Write object', function (done) {
      let mutations = [{ type: MutationTypes.REMOVE_WRITE, payload: write }]
      var states = {writes: [write]}
      var test = new VuexActionTester(WriteActions.webBluetoothDFUWriteRemove, write, states, mutations, done)
      test.run(0)
    })
  })
  describe('webBluetoothDFUTransferWrite', function () {
    /*
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
    */
  })
})
