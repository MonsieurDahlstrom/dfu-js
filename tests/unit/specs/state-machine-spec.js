import {expect} from 'chai'
import sinon from 'sinon'

import factory from '../factories'

import {DFUStateMachineStates,DFUStateMachine} from '../../../src/models/state-machine'
import {Transfer,TransferStates} from '../../../src/models/transfer'

import testFirmwareAtPath from '../shared/statemachine-firmware-specs.js'

//import {Firmware,FirmwareType} from '../../src/models/firmware'


describe('StateMachine', function() {

  before(function () {
    this.sandbox = sinon.createSandbox()
  })
  beforeEach(function () {
    this.stateMachine = new DFUStateMachine()
  })
  afterEach(function() {
    this.stateMachine = null;
    this.sandbox.restore()
  })

  describe("#constructor", function() {
    describe("without characteristics", function() {
      it("throws no error", function() {
        expect(()=> new DFUStateMachine()).to.not.throw()
      })
      it("is an instance of StateMachien", function() {
        expect(this.stateMachine instanceof DFUStateMachine).to.be.true;
      })
      it("is not configured", function() {
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.NOT_CONFIGURED)
      })
      it('progress shouldnt be started', function () {
        expect(this.stateMachine.progress.completed).to.equal(0.0)
      })
    })

    describe("with characteristics", function() {
      let controlPoint
      let packetPoint
      let stateMachine
      beforeEach(function() {
        controlPoint = {}
        packetPoint = {}
        this.stateMachine = new DFUStateMachine(controlPoint,packetPoint)
      })
      it("throws no error", function() {
        expect(()=> new DFUStateMachine(controlPoint,packetPoint)).to.not.throw()
      })
      it("is an instance of StateMachien", function() {
        expect(this.stateMachine instanceof DFUStateMachine).to.be.true;
      })
      it("is not configured", function() {
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.IDLE)
      })
      it("has control point characteristic", function() {
        expect(this.stateMachine.controlPoint).to.equal(controlPoint)
      })
      it("has packet point characteristic", function() {
        expect(this.stateMachine.packetPoint).to.equal(packetPoint)
      })
      it('progress shouldnt be started', function () {
        expect(this.stateMachine.progress.completed).to.equal(0.0)
      })
    })
  })

  describe("set controlPoint", function () {
    beforeEach(function (done) {
      factory.create('webBluetoothCharacteristic')
      .then(item => {
        this.characteristic = item
        this.stateMachine.packetPoint = this.characteristic
        done()
      })
      .catch(err => done(err))
    })
    afterEach(function () {
      this.characteristic = null
    })
    describe('IDLE', function () {
      it("set undefined", function () {
        this.stateMachine.state = DFUStateMachineStates.IDLE
        this.stateMachine.controlPoint = undefined
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.NOT_CONFIGURED)
      })
      it("set null", function () {
        this.stateMachine.state = DFUStateMachineStates.IDLE
        this.stateMachine.packetPoint = this.characteristic
        this.stateMachine.controlPoint = null
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.NOT_CONFIGURED)
      })
    })
    describe('NOT_CONFIGURED', function () {
      it("set object", function () {
        this.stateMachine.controlPoint = this.characteristic
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.IDLE)
      })
    })
  })

  describe("set packetPoint", function () {
    beforeEach(function (done) {
      factory.create('webBluetoothCharacteristic')
      .then(item => {
        this.characteristic = item
        this.stateMachine.controlPoint = this.characteristic
        done()
      })
      .catch(err => done(err))
    })
    afterEach(function () {
      this.characteristic = null
    })
    describe('IDLE', function () {
      it("set undefined", function () {
        this.stateMachine.state = DFUStateMachineStates.IDLE
        this.stateMachine.packetPoint = undefined
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.NOT_CONFIGURED)
      })
      it("set null", function () {
        this.stateMachine.state = DFUStateMachineStates.IDLE
        this.stateMachine.packetPoint = null
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.NOT_CONFIGURED)
      })
    })
    describe('NOT_CONFIGURED', function () {
      it("set object", function () {
        this.stateMachine.packetPoint = this.characteristic
        expect(this.stateMachine.state).to.equal(DFUStateMachineStates.IDLE)
      })
    })
  })

  describe("#addTransfer", function () {
    beforeEach(function(done){
      this.stateMachine.state = DFUStateMachineStates.IDLE
      factory.create('transfer')
      .then(transfer => {
        this.transfer = transfer
        done()
      })
      .catch(err => done(err))
    })
    describe("failing tasks", function () {
      it("dfu machine eventually fails", function(done) {
        this.sandbox.stub(this.transfer,'begin').callsFake(() => {
          this.transfer.state = TransferStates.Failed
        });
        this.stateMachine.addTransfer(this.transfer)
        this.stateMachine.on('stateChanged', () => {
          expect(this.stateMachine.state).to.equal(DFUStateMachineStates.FAILED)
          done()
        })
      })
    })
    describe('succeding tasks', function () {
      it("dfu machine eventually completes", function(done) {
        this.sandbox.stub(this.transfer,'begin').callsFake(() => {
          this.transfer.state = TransferStates.Completed
        });
        this.stateMachine.addTransfer(this.transfer)
        this.stateMachine.on('stateChanged', () => {
          expect(this.stateMachine.state).to.equal(DFUStateMachineStates.COMPLETE)
          done()
        })
      })
    })
  })

  describe("#progress", function () {
    let controlPoint
    let packetPoint
    let stateMachine
    before(function() {
      controlPoint = {}
      packetPoint = {}
    })
    beforeEach(function () {
      this.stateMachine = new DFUStateMachine(controlPoint,packetPoint)
    })
    it('when not configured', function () {
      this.stateMachine.state = DFUStateMachineStates.NOT_CONFIGURED
      this.stateMachine.calculateProgress()
      expect(this.stateMachine.progress.completed).to.equal(0.0)
    })
    it('when idle', function () {
      this.stateMachine.state = DFUStateMachineStates.IDLE
      this.stateMachine.calculateProgress()
      expect(this.stateMachine.progress.completed).to.equal(0.0)
    })
    describe('when transfer', function () {
      beforeEach(function (done) {
        factory.create('transfer')
        .then(transfer => {
          this.transfer = transfer
          this.stateMachine.queue.pause()
          this.stateMachine.addTransfer(this.transfer)
          this.stateMachine.state = DFUStateMachineStates.TRANSFERING
          this.transfer.state = TransferStates.Transfer
          done()
        })
        .catch(err => done(err))
      })
      it('but not started', function () {
        this.transfer.progress = 0.00
        this.stateMachine.calculateProgress()
        expect(this.stateMachine.progress.completed).to.equal(0.0)
      })
      it('just started', function () {
        this.transfer.progress = 0.05
        this.stateMachine.calculateProgress()
        expect(this.stateMachine.progress.completed).to.equal(0.05*this.transfer.file.length)
      })
      it('just finished', function () {
        this.transfer.state = TransferStates.Completed
        this.stateMachine.calculateProgress()
        expect(this.stateMachine.progress.completed).to.equal(this.transfer.file.length)
      })
    })
    it('when completed', function () {
      this.stateMachine.state = DFUStateMachineStates.COMPLETE
      this.stateMachine.calculateProgress()
      expect(this.stateMachine.progress.completed).to.equal(1.0)
    })
    it('when failed', function () {
      this.stateMachine.state = DFUStateMachineStates.FAILED
      this.stateMachine.calculateProgress()
      expect(this.stateMachine.progress.completed).to.equal(1.0)
    })
  })

  describe('#sendFirmware', function() {
    describe('softdevice & bootloader', function () {
      testFirmwareAtPath('tests/unit/data/bl_sd.zip')
    })
    describe('application dfu', function() {
      testFirmwareAtPath('tests/unit/data/dfu_test_app_hrm_s130.zip')
    })
  })

  describe("#reset", function () {
    beforeEach(function () {
      this.stateMachine.state = DFUStateMachineStates.TRANSFERING
      this.stateMachine.queue.pause()
      this.stateMachine.queue.push({emptyObject: ''})
    })
    it('does not throw', function () {
      expect(() => this.stateMachine.reset()).to.not.throw()
    })
    it('sets dfu machine idle', function () {
      this.stateMachine.reset()
      expect(this.stateMachine.state).to.equal(DFUStateMachineStates.IDLE)
    })
    it('empties the dfu machine transfer queue', function () {
      this.stateMachine.reset()
      expect(this.stateMachine.queue.length()).to.equal(0)
    })
  })
})
