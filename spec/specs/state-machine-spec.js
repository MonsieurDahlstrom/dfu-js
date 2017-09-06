import {expect} from 'chai'
import sinon from 'sinon'

import {DFUStateMachineStates,DFUStateMachine} from '../../src/models/state-machine'
import {Firmware,FirmwareType} from '../../src/models/firmware'
import JSZip from 'jszip'

const SharedDFUParseZip = function (testZipPath) {
  beforeEach(function (done) {
    var oReq = new XMLHttpRequest();
    this.sandbox = sinon.sandbox.create()
    this.stateMachine = new DFUStateMachine()
    oReq.addEventListener("load", () => {
      JSZip.loadAsync(oReq.response)
      .then(zip => {
        this.firmware = new Firmware(zip)
        return this.firmware.parseManifest()
      })
      .then(() => {
        done()
      })
      .catch(err => {
        done(err)
      })
    })
    oReq.open('GET',testZipPath)
    oReq.responseType = "arraybuffer";
    oReq.send();
  })
  afterEach(function () {
    this.firmware = undefined
    this.sandbox.restore()
  })

  it('fails when not configured', function() {
    expect( () => this.stateMachine.sendFirmware(this.firmware) ).to.throw("StateMachine is not configured with bluetooth characteristics");
  })
  it('fails when not idle', function() {
    this.stateMachine.state = DFUStateMachineStates.TRANSFERING
    expect( () => this.stateMachine.sendFirmware(this.firmware) ).to.throw("Can only initate transfer when idle")
  })

  it('fails without firmware', function() {
    this.stateMachine.state = DFUStateMachineStates.IDLE
    expect( () => this.stateMachine.sendFirmware(null) ).to.throw("Firmware needs to be of class Firmware");
  })

  it('succeed when idle and firmware is valid', function() {
    this.stateMachine.state = DFUStateMachineStates.IDLE
    this.stateMachine.transfers.pause()
    expect( () => this.stateMachine.sendFirmware(this.firmware) ).to.not.throw();
  })

  it("addTransfers called", function() {
    this.stateMachine.state = DFUStateMachineStates.IDLE
    this.stateMachine.transfers.pause()
    let spyObject = this.sandbox.spy(this.stateMachine, 'addTransfer');
    expect( () => this.stateMachine.sendFirmware(this.firmware) ).to.not.throw();
    expect(spyObject.calledTwice).to.be.true
  })

  it('progress should be incomplete', function() {
    this.stateMachine.state = DFUStateMachineStates.IDLE
    this.stateMachine.transfers.pause()
    this.stateMachine.sendFirmware(this.firmware);
    expect(this.stateMachine.progress).not.to.equal(1.0);
  })

}

describe('StateMachine', function() {
  let stateMachine;

  afterEach(function() {
    stateMachine = null;
  })

  describe("#constructor", function() {
    describe("without characteristics", function() {
      it("throws no error", function() {
        expect(()=> stateMachine = new DFUStateMachine()).to.not.throw()
      })
      it("is an instance of StateMachien", function() {
        let stateMachine = new DFUStateMachine()
        expect(stateMachine instanceof DFUStateMachine).to.be.true;
      })
      it("is not configured", function() {
        let stateMachine = new DFUStateMachine()
        expect(stateMachine.state).to.equal(DFUStateMachineStates.NOT_CONFIGURED)
      })
      it('progress shouldnt be started', function () {
        let stateMachine = new DFUStateMachine()
        expect(stateMachine.progress).to.equal(0.0)
      })
    })

    describe("with characteristics", function() {
      let controlPoint
      let packetPoint
      let stateMachine
      before(function() {
        controlPoint = {}
        packetPoint = {}
      })
      beforeEach(function () {
        stateMachine = new DFUStateMachine(controlPoint,packetPoint)
      })
      it("throws no error", function() {
        expect(()=> stateMachine = new DFUStateMachine(controlPoint,packetPoint)).to.not.throw()
      })
      it("is an instance of StateMachien", function() {
        expect(stateMachine instanceof DFUStateMachine).to.be.true;
      })
      it("is not configured", function() {
        expect(stateMachine.state).to.equal(DFUStateMachineStates.IDLE)
      })
      it("has control point characteristic", function() {
        expect(stateMachine.controlPoint).to.equal(controlPoint)
      })
      it("has packet point characteristic", function() {
        expect(stateMachine.packetPoint).to.equal(packetPoint)
      })
      it('progress shouldnt be started', function () {
        expect(stateMachine.progress).to.equal(0.0)
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
      stateMachine = new DFUStateMachine(controlPoint,packetPoint)
    })
    it('when not configured', function () {
      stateMachine.state = DFUStateMachineStates.NOT_CONFIGURED
      stateMachine.calculateProgress()
      expect(stateMachine.progress.completed).to.equal(0.0)
    })
    it('when idle', function () {
      stateMachine.state = DFUStateMachineStates.IDLE
      stateMachine.calculateProgress()
      expect(stateMachine.progress.completed).to.equal(0.0)
    })
    it('when transfering', function () {
      stateMachine.state = DFUStateMachineStates.TRANSFERING
      stateMachine.calculateProgress()
      expect(stateMachine.progress.completed).to.equal(0.0)
    })
    it('when completed', function () {
      stateMachine.state = DFUStateMachineStates.COMPLETE
      stateMachine.calculateProgress()
      expect(stateMachine.progress.completed).to.equal(1.0)
    })
    it('when failed', function () {
      stateMachine.state = DFUStateMachineStates.FAILED
      stateMachine.calculateProgress()
      expect(stateMachine.progress.completed).to.equal(1.0)
    })
  })

  describe('#sendFirmware', function() {

    describe('softdevice & bootloader', function () {
      SharedDFUParseZip('/base/spec/data/bl_sd.zip')
    })

    describe('application dfu', function() {
      SharedDFUParseZip('/base/spec/data/dfu_test_app_hrm_s130.zip')
    })

  })
})
