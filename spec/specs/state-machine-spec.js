import {expect} from 'chai'
import sinon from 'sinon'

import {DFUStateMachineStates,DFUStateMachine} from '../../src/models/state-machine'
import {Firmware,FirmwareType} from '../../src/models/firmware'
import fs from 'fs'
import JSZip from 'jszip'

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
      expect(stateMachine.progress).to.equal(0.0)
    })
    it('when idle', function () {
      stateMachine.state = DFUStateMachineStates.IDLE
      stateMachine.calculateProgress()
      expect(stateMachine.progress).to.equal(0.0)
    })
    it('when transfering', function () {
      stateMachine.state = DFUStateMachineStates.TRANSFERING
      stateMachine.calculateProgress()
      expect(stateMachine.progress).to.equal(0.0)
    })
    it('when completed', function () {
      stateMachine.state = DFUStateMachineStates.COMPLETE
      stateMachine.calculateProgress()
      expect(stateMachine.progress).to.equal(1.0)
    })
    it('when failed', function () {
      stateMachine.state = DFUStateMachineStates.FAILED
      stateMachine.calculateProgress()
      expect(stateMachine.progress).to.equal(1.0)
    })
  })

  describe('#sendFirmware', function() {

    describe('softdevice & bootloader', function () {
      let firmware;
      let stateMachine;
      let sandbox
      before(function(done) {
        sandbox = sinon.sandbox.create()
        let content = fs.readFileSync('spec/data/bl_sd.zip')
        JSZip.loadAsync(content)
        .then(zip => {
          firmware = new Firmware(zip)
          return firmware.parseManifest()
        })
        .then(() => {
          done();
        })
      })

      beforeEach(function() {
        stateMachine = new DFUStateMachine();
      })

      afterEach(function() {
        sandbox.restore()
        stateMachine = undefined;
      })

      it('fails when not configured', function() {
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.throw("StateMachine is not configured with bluetooth characteristics");
      })
      it('fails when not idle', function() {
        stateMachine.state = DFUStateMachineStates.TRANSFERING
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.throw("Can only initate transfer when idle")
      })

      it('fails without firmware', function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        expect( function() {
          stateMachine.sendFirmware(null);
        }).to.throw("Firmware needs to be of class Firmware");
      })

      it('succeed when idle and firmware is valid', function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        stateMachine.transfers.pause()
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.not.throw();
      })

      it("addTransfers called", function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        stateMachine.transfers.pause()
        let spyObject = sandbox.spy(stateMachine, 'addTransfer');
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.not.throw();
        expect(spyObject.calledTwice).to.be.true
      })

      it('progress should be incomplete', function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        stateMachine.transfers.pause()
        stateMachine.sendFirmware(firmware);
        expect(stateMachine.progress).not.to.equal(1.0);
      })
    })

    describe('application dfu', function() {
      let firmware;
      let stateMachine;
      let sandbox
      before(function(done) {
        sandbox = sinon.sandbox.create()
        let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
        JSZip.loadAsync(content)
        .then(zip => {
          firmware = new Firmware(zip)
          return firmware.parseManifest()
        })
        .then(() => {
          done();
        })
      })

      beforeEach(function() {
        stateMachine = new DFUStateMachine();
      })

      afterEach(function() {
        sandbox.restore()
        stateMachine = undefined;
      })


      it('fails when not configured', function() {
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.throw("StateMachine is not configured with bluetooth characteristics");
      })

      it('fails when not idle', function() {
        stateMachine.state = DFUStateMachineStates.TRANSFERING
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.throw("Can only initate transfer when idle")
      })

      it('fails without firmware', function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        expect( function() {
          stateMachine.sendFirmware(null);
        }).to.throw("Firmware needs to be of class Firmware");
      })

      it('succeed when idle and firmware is valid', function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        stateMachine.transfers.pause()
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.not.throw();
      })

      it("addTransfers called", function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        stateMachine.transfers.pause()
        let spyObject = sandbox.spy(stateMachine, 'addTransfer');
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).to.not.throw();
        expect(spyObject.calledTwice).to.be.true
      })

      it('progress should be incomplete', function() {
        stateMachine.state = DFUStateMachineStates.IDLE
        stateMachine.transfers.pause()
        stateMachine.sendFirmware(firmware);
        expect(stateMachine.progress).not.to.equal(1.0);
      })

    })

  })
})
