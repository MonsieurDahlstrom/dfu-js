import {expect} from 'chai'
import JSZip from 'jszip'
import fs from 'fs'
//
import factory from '../../factories'
import VuexActionTester from '../../helpers/vuex-action-tester'
//
import {Firmware} from '../../../../src/models/firmware'
import {Update, UpdateStates} from '../../../../src/models/update'
import Transfer from '../../../../src/models/transfer'
import UpdateActions from '../../../../src/actions/update-actions'
import * as MutationTypes from '../../../../src/mutation-types'

const SharedZipBuilder = function(context,zipPath) {
  beforeEach(function (done) {
    JSZip.loadAsync(fs.readFileSync(zipPath))
    .then(zip => {
      context.firmware = new Firmware(zip)
      return context.firmware.parseManifest()
    })
    .then(() => {
      done()
    })
  })
  afterEach(function () {
    context.firmware = undefined
  })
}
const SharedCreateUpdateForZip = function (context) {
  beforeEach(function (done) {
    factory.build('update')
    .then(newUpdate => {
      context.update = newUpdate
      done()
    })
  })
  afterEach(function () {
    context.update = undefined
  })
  it('not configured state', function (done) {
    context.update.state = UpdateStates.NOT_CONFIGURED
    var payload = {firmware: context.firmware, update: context.update}
    var test = new VuexActionTester(UpdateActions.webBluetoothDFUSendFirmware, payload, [], [], done)
    test.run()
  })
  it('transfering state', function (done) {
    context.update.state = UpdateStates.TRANSFERING
    var payload = {firmware: context.firmware, update: context.update}
    var test = new VuexActionTester(UpdateActions.webBluetoothDFUSendFirmware, payload, [], [], done)
    test.run()
  })
  it('idle state', function (done) {
    context.update.state = UpdateStates.IDLE
    var payload = {firmware: context.firmware, update: context.update}
    var dispatches = [
      {
        type: 'webBluetoothDFUTransferAdd',
        validation: function (payload) {
          expect(payload instanceof Transfer).to.be.true
        }
      },
      {
        type: 'webBluetoothDFUTransferAdd',
        validation: function (payload) {
          expect(payload instanceof Transfer).to.be.true
        }
      }
    ]
    var mutations = [
      {
        type: MutationTypes.MODIFED_UPDATE,
        validation: function (payload) {
          expect(payload instanceof Update).to.be.true
          expect(payload.transfers.length).to.equal(2)
        }
      }
    ]
    var test = new VuexActionTester(UpdateActions.webBluetoothDFUSendFirmware, payload, mutations, dispatches, done)
    test.run()
  })
  it('without firmware', function (done) {
    context.update.state = UpdateStates.IDLE
    var payload = {firmware: undefined, update: context.update}
    var test = new VuexActionTester(UpdateActions.webBluetoothDFUSendFirmware, payload, [], [], done)
    test.run()
  })
}

describe('Update Actions', function () {

  describe('#webBluetoothDFUCreateUpdate', function () {
    beforeEach(function(done) {
      factory.build('webBluetoothDevice')
      .then(device => {
        this.device = device
        done()
      })
    })
    afterEach(function () {
      this.device = undefined
    })
    it('adds update', function (done) {
      let mutations = [
        {
          type: MutationTypes.ADD_UPDATE,
          validation: function (payload) {
            expect(payload instanceof Update).to.be.true
            expect(payload.state).to.equal(UpdateStates.IDLE)
          }
        }
      ]
      var test = new VuexActionTester(UpdateActions.webBluetoothDFUCreateUpdate, this.device, mutations, [], done)
      test.run()
    })
  })

  describe('#webBluetoothDFURemoveUpdate', function () {
    beforeEach(function (done) {
      factory.build('update')
      .then(update => {
        this.update = update
        done()
      })
    })
    afterEach(function() {
      this.update = undefined
    })
    it('remove update', function (done) {
      let mutations = [
        {
          type: MutationTypes.REMOVE_UPDATE,
          validation: function (payload) {
            expect(payload instanceof Update).to.be.true
          }
        }
      ]
      var test = new VuexActionTester(UpdateActions.webBluetoothDFURemoveUpdate, this.update, mutations, [], done)
      test.run()
    })
  })

  describe('#webBluetoothDFUCancelUpdate', function () {
    beforeEach(function (done) {
      factory.build('update')
      .then(update => {
        this.update = update
        done()
      })
    })
    afterEach(function() {
      this.update = undefined
    })
    it('refreshes object in state', function (done) {
      let mutations = [
        {
          type: MutationTypes.MODIFED_UPDATE,
          validation: function (payload) {
            expect(payload instanceof Update).to.be.true
            expect(payload.state).to.equal(UpdateStates.FAILED)
          }
        }
      ]
      var test = new VuexActionTester(UpdateActions.webBluetoothDFUCancelUpdate, this.update, mutations, [], done)
      test.run()
    })
  })

  describe('#webBluetoothDFURestoreUpdate', function () {
    beforeEach(function(done) {
      factory.build('webBluetoothDevice')
      .then(device => {
        this.device = device
        return factory.build('update')
        .then(update => {
          this.update = update
          done()
        })
      })
    })
    afterEach(function () {
      this.device = undefined
      this.update = undefined
    })
    it('sets new bluetooth characteristics', function (done) {
      let mutations = [
        {
          type: MutationTypes.MODIFED_UPDATE,
          validation: function (payload) {
            expect(payload instanceof Update).to.be.true
            expect(payload.state).to.equal(UpdateStates.IDLE)
          }
        }
      ]
      let payload = {bluetoothDevice: this.device, update: this.update}
      var test = new VuexActionTester(UpdateActions.webBluetoothDFURestoreUpdate, payload, mutations, [], done)
      test.run()
    })
  })

  describe("#webBluetoothDFUSendFirmware", function () {
    describe('softdevice & bootloader', function () {
      SharedZipBuilder(this,'test/unit/data/bl_sd.zip')
      SharedCreateUpdateForZip(this)
    })
    describe('application', function () {
      SharedZipBuilder(this,'test/unit/data/dfu_test_app_hrm_s130.zip')
      SharedCreateUpdateForZip(this)
    })
  })

})
