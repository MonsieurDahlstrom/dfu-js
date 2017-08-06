import factory from 'factory-girl'
import sinon from 'sinon'
import {expect} from 'chai'
import WriteFactories from '../../factories/write-factory'
import WriteActions from "../../../src/actions/write-actions"
import WriteMutations from '../../../src/mutations/write-mutations'
import * as MutationTypes from '../../../src/mutation-types'
import VuexActionTester from '../../helpers/web-bluetooth-dfu/vuex-action-tester'
import TransmissionStatus from '../../../src/types/transmission-types'

describe('Write Actions', function () {

  var sandbox
  let write
  let state
  beforeEach(function (done) {
    sandbox = sinon.sandbox.create()
    state = {writes: []}
    factory.build('writeChecksum')
    .then((checksum) => {
      write = checksum
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe('webBluetoothDFUScheduleWrite', function() {
    it('accepts Write object', function (done) {
      let validationFunc = function (payload) {
        try {
          expect(payload).to.deep.equal(write)
        } catch (err) {
          return false
        } finally {
          return true
        }
       }
      let mutations = [{ type: MutationTypes.ADD_WRITE, validation: validationFunc }]
      var test = new VuexActionTester(WriteActions.webBluetoothDFUScheduleWrite, write, state, mutations, done)
      test.run()
    })
    it('does not store none write object', function (done) {
      var test = new VuexActionTester(WriteActions.webBluetoothDFUScheduleWrite, {}, state, [], done)
      test.run()
    })
  })
  describe('webBluetoothDFURemoveWrite', function () {
    it('accepts Write object', function (done) {
      let validationFunc = function (payload) {
        try {
          expect(payload).to.deep.equal(write)
        } catch (err) {
          return false
        } finally {
          return true
        }
       }
       let mutations = [{ type: MutationTypes.REMOVE_WRITE, validation: validationFunc }]
       var test = new VuexActionTester(WriteActions.webBluetoothDFUWriteRemove, write, state, mutations, done)
       test.run()
    })
    it('does not store none write object', function (done) {
      var test = new VuexActionTester(WriteActions.webBluetoothDFUWriteRemove, {}, state, [], done)
      test.run()
    })
  })
  describe('webBluetoothDFUTransferWrite', function () {
    it('succesfull complete', function (done) {
      var writeValueStub = sandbox.stub().returns(true)
      write.characteristic.writeValue = writeValueStub
      let validationFunc = function (payload) { return payload.state === TransmissionStatus.Completed}
      let mutations = [{ type: MutationTypes.UPDATE_WRITE, validation: validationFunc }]
      var test = new VuexActionTester(WriteActions.webBluetoothDFUExecuteWrite, write, state, mutations, done)
      test.run()
    })
    it('does not store none write object', function (done) {
      var test = new VuexActionTester(WriteActions.webBluetoothDFUExecuteWrite, {}, state, [], done)
      test.run()
    })
    it('sucessfull on retry', function (done) {
      var writeValueStub = sandbox.stub().throws()
      writeValueStub.onCall(0).throws()
      writeValueStub.onCall(1).throws()
      writeValueStub.onCall(2).returns(true)
      write.characteristic.writeValue = writeValueStub
      let validationFunc = function (payload) { return payload.state === TransmissionStatus.Completed}
      let mutations = [{ type: MutationTypes.UPDATE_WRITE, validation: validationFunc }]
      var test = new VuexActionTester(WriteActions.webBluetoothDFUExecuteWrite, write, state, mutations, done)
      test.run()
    })
    it('maximum attempts', function (done) {
      var writeValueStub = sandbox.stub().throws()
      write.characteristic.writeValue = writeValueStub
      let validationFunc = function (payload) { return payload.state === TransmissionStatus.Failed}
      let mutations = [{ type: MutationTypes.UPDATE_WRITE, validation: validationFunc }]
      var test = new VuexActionTester(WriteActions.webBluetoothDFUExecuteWrite, write, state, mutations, done)
      test.run()
    })
  })
})
