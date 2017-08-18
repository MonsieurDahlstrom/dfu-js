import {expect} from 'chai'
import Vue from 'vue'
import Vuex from 'Vuex'
Vue.use(Vuex)
//
import factory from '../factories'
//
import {Firmware, FirmwareType, VuexModule} from '../../../src'
import DFUModule from '../../../src'
import {Update, UpdateStates} from '../../../src/models/update'

describe('DFU Vuex Module', function () {
  describe("named exports", function () {
    it("Firmware", function () { expect(Firmware).to.not.be.undefined })
    it("FirmwareTypes", function () { expect(FirmwareType).to.not.be.undefined})
    it("VuexModule", function () { expect(VuexModule).to.not.be.undefined})
  })
  describe('default export', function () {
    it('got state', function () {
      expect(DFUModule.state).to.not.be.undefined
    })
    it('has getters', function () {
      expect(DFUModule.getters).to.not.be.undefined
    })
    it('got actions', function () {
      expect(DFUModule.actions).to.not.be.undefined
    })
    it('got mutations', function () {
      expect(DFUModule.mutations).to.not.be.undefined
    })
    it('insert into a vuex instance', function () {
      expect(new Vuex.Store( {plugins: [], state: { }, modules: {DFUModule} })).to.not.throw
    })
    describe('getters', () => {
      beforeEach(function () {
        this.store = new Vuex.Store( {plugins: [], state: { }, modules: {DFUModule} })
      })
      afterEach(function () {
        this.store = undefined
      })
      it('#webBluetoothUpdateForDevice', function (done) {
        factory.create('webBluetoothDevice')
        .then(device => {
          this.device = device
          return this.store.dispatch('webBluetoothDFUCreateUpdate', this.device)
          .then(() => {
            let result = this.store.getters.webBluetoothUpdateForDevice(device)
            expect(result instanceof Update).to.be.true
            done()
          })
        })
      })
      it('#webBluetoothRunningUpdates', function (done) {
        factory.create('webBluetoothDevice')
        .then(device => {
          this.device = device
          return this.store.dispatch('webBluetoothDFUCreateUpdate', this.device)
          .then(() => {
            this.store.state.DFUModule.updates[0].state = UpdateStates.TRANSFERING
            let result = this.store.getters.webBluetoothRunningUpdates
            expect(result).to.be.an('Array')
            expect(result[0] instanceof Update).to.be.true
            done()
          })
        })
      })
      it('#webBluetoothTransferForUpdate')
      it('#webBluetoothObjectForTransfer')
      it('#webBluetoothWriteForObject')
    })
  })
})
