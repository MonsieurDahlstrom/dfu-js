import factory from '../../factories'
import sinon from 'sinon'
import {expect} from 'chai'
//
import VuexActionTester from '../../helpers/vuex-action-tester'
//
import WriteActions from "../../../../src/actions/write-actions"
import WriteMutations from '../../../../src/mutations/write-mutations'
import * as MutationTypes from '../../../../src/mutation-types'
import TransmissionStatus from '../../../../src/models/transmission-types'

describe.only('Write Actions', function () {

  beforeEach(function (done) {
    this.sandbox = sinon.sandbox.create()
    factory.build('writeChecksum')
    .then((checksum) => {
      this.write = checksum
      return factory.create('writePackage')
      .then(writePackage => {
        this.package = writePackage
        done()
      })
    })
    .catch((err) => {
      console.error(err)
    })
  });
  afterEach(function () {
    this.sandbox.restore()
    this.write = undefined
  });

  describe('#addDeviceFirmwareUpgradeCommand', function() {
    it('accepts Write object', function (done) {
      let validationFunc = function (payload) {
        expect(payload).to.deep.equal(this.write)
      }.bind(this)
      let mutations = [{ type: MutationTypes.ADD_WRITE, validation: validationFunc }]
      var test = new VuexActionTester(WriteActions.addDeviceFirmwareUpgradeCommand, this.write, mutations, [], done)
      test.run()
    })
    it('does not store none write object', function (done) {
      var test = new VuexActionTester(WriteActions.addDeviceFirmwareUpgradeCommand, {}, [], [], done)
      test.run()
    })
  })
  describe('#addDeviceFirmwareUpgradePacket', function() {
    it('accepts Write object', function (done) {
      let validationFunc = function (payload) {
        expect(payload).to.deep.equal(this.package)
      }.bind(this)
      let mutations = [{ type: MutationTypes.ADD_WRITE, validation: validationFunc }]
      var test = new VuexActionTester(WriteActions.addDeviceFirmwareUpgradePacket, this.package, mutations, [], done)
      test.run()
    })
    it('does not store none write object', function (done) {
      var test = new VuexActionTester(WriteActions.addDeviceFirmwareUpgradePacket, {}, [], [], done)
      test.run()
    })
  })

  describe('#removeDeviceFirmwareUpgradeWrite', function () {
    it('accepts Write object', function (done) {
      let validationFunc = function (payload) {
        expect(payload).to.deep.equal(this.write)
      }.bind(this)
       let mutations = [{ type: MutationTypes.REMOVE_WRITE, validation: validationFunc }]
       var test = new VuexActionTester(WriteActions.removeDeviceFirmwareUpgradeWrite, this.write, mutations, [], done)
       test.run()
    })
    it('does not store none write object', function (done) {
      var test = new VuexActionTester(WriteActions.removeDeviceFirmwareUpgradeWrite, {}, [], [], done)
      test.run()
    })
  })

  describe('#performDeviceFirmwareUpgradeCommand', function () {
    it('rejects array', function (done) {
      this.write.bytes = [1]
      let mutations = [
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Transfering)
          }
        },
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.not.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Failed)
          }
        }
      ]
      var test = new VuexActionTester(WriteActions.performDeviceFirmwareUpgradeCommand, this.write, mutations, [], done)
      test.run()
    })
    it('accepts ArrayBuffer', function (done) {
      let mutations = [
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Transfering)
          }
        },
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Completed)
          }
        }
      ]
      var test = new VuexActionTester(WriteActions.performDeviceFirmwareUpgradeCommand, this.write, mutations, [], done)
      test.run()
    })
    it('sucessfull on retry', function (done) {
      var writeValueStub = this.sandbox.stub().throws()
      writeValueStub.onCall(0).throws()
      writeValueStub.onCall(1).throws()
      writeValueStub.onCall(2).returns(true)
      this.write.characteristic.writeValue = writeValueStub
      let mutations = [
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Transfering)
          }
        },
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Completed)
          }
        }
      ]
      var test = new VuexActionTester(WriteActions.performDeviceFirmwareUpgradeCommand, this.write, mutations, [], done)
      test.run()
    })
    it('maximum attempts', function (done) {
      var writeValueStub = this.sandbox.stub().throws()
      this.write.characteristic.writeValue = writeValueStub
      let mutations = [
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Transfering)
          }
        },
        {
          type: MutationTypes.UPDATE_WRITE,
          validation: function (payload) {
            expect(payload.error).to.not.be.undefined
            expect(payload.state).to.equal(TransmissionStatus.Failed)
          }
        }
      ]
      var test = new VuexActionTester(WriteActions.performDeviceFirmwareUpgradeCommand, this.write, mutations, [], done)
      test.run()
    })
  })

})