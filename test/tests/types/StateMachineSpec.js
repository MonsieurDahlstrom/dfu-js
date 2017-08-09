/*
import {States,StateMachine} from '../../src/state-machine'
import {Firmware,FirmwareType} from '../../src/firmware'
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
        expect(()=> stateMachine = new StateMachine()).not.toThrow()
      })
      it("is an instance of StateMachien", function() {
        let stateMachine = new StateMachine()
        expect(stateMachine instanceof StateMachine).toBeTruthy();
      })
      it("is not configured", function() {
        let stateMachine = new StateMachine()
        expect(stateMachine.state).toBe(States.NOT_CONFIGURED)
      })
      it('progress shouldnt be started', function () {
        let stateMachine = new StateMachine()
        expect(stateMachine.progress()).toBe(0.0)
      })
    })

    describe("with characteristics", function() {
      let controlPoint
      let packetPoint
      let stateMachine
      beforeAll(function() {
        controlPoint = {}
        packetPoint = {}
      })
      beforeEach(function () {
        stateMachine = new StateMachine(controlPoint,packetPoint)
      })
      it("throws no error", function() {
        expect(()=> stateMachine = new StateMachine(controlPoint,packetPoint)).not.toThrow()
      })
      it("is an instance of StateMachien", function() {
        expect(stateMachine instanceof StateMachine).toBeTruthy();
      })
      it("is not configured", function() {
        expect(stateMachine.state).toBe(States.IDLE)
      })
      it("has control point characteristic", function() {
        expect(stateMachine.controlpointCharacteristic).toBe(controlPoint)
      })
      it("has packet point characteristic", function() {
        expect(stateMachine.packetCharacteristic).toBe(packetPoint)
      })
      it('progress shouldnt be started', function () {
        expect(stateMachine.progress()).toBe(0.0)
      })
    })
  })

  describe("#progress", function () {
    let controlPoint
    let packetPoint
    let stateMachine
    beforeAll(function() {
      controlPoint = {}
      packetPoint = {}
    })
    beforeEach(function () {
      stateMachine = new StateMachine(controlPoint,packetPoint)
    })
    it('when not configured', function () {
      stateMachine.state = States.NOT_CONFIGURED
      expect(stateMachine.progress()).toBe(0.0)
    })
    it('when idle', function () {
      stateMachine.state = States.IDLE
      expect(stateMachine.progress()).toBe(0.0)
    })
    it('when transfering', function () {
      stateMachine.state = States.TRANSFERING
      expect(stateMachine.progress()).toBe(0.0)
    })
    it('when completed', function () {
      stateMachine.state = States.COMPLETE
      expect(stateMachine.progress()).toBe(1.0)
    })
    it('when failed', function () {
      stateMachine.state = States.FAILED
      expect(stateMachine.progress()).toBe(1.0)
    })
  })

  describe('#sendFirmware', function() {

    describe('softdevice & bootloader', function () {
      let firmware;
      let stateMachine;
      beforeAll(function(done) {
        let content = fs.readFileSync('spec/data/bl_sd.zip')
        return JSZip.loadAsync(content)
        .then(zip => {
          firmware = new Firmware(zip)
          return firmware.parseManifest()
        })
        .then(() => {
          done();
        })
      })

      beforeEach(function() {
        stateMachine = new StateMachine();
      })

      afterEach(function() {
        stateMachine = undefined;
      })

      it('fails when not configured', function() {
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).toThrowError("StateMachine is not configured with bluetooth characteristics");
      })
      it('fails when not idle', function() {
        stateMachine.state = States.TRANSFERING
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).toThrowError("Can only initate transfer when idle")
      })

      it('fails without firmware', function() {
        stateMachine.state = States.IDLE
        expect( function() {
          stateMachine.sendFirmware(null);
        }).toThrowError("Firmware needs to be of class Firmware");
      })

      it('succeed when idle and firmware is valid', function() {
        stateMachine.state = States.IDLE
        stateMachine.fileTransfers.pause()
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).not.toThrow();
      })

      it("addTransfers called", function() {
        stateMachine.state = States.IDLE
        stateMachine.fileTransfers.pause()
        let spyObject = spyOn(stateMachine, 'addTransfer');
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).not.toThrow();
        expect(spyObject.calls.count()).toBe(2);
      })

      it('progress should be incomplete', function() {
        stateMachine.state = States.IDLE
        stateMachine.fileTransfers.pause()
        stateMachine.sendFirmware(firmware);
        expect(stateMachine.progress()).not.toBe(1.0);
      })
    })

    describe('application dfu', function() {
      let firmware;
      let stateMachine;

      beforeAll(function(done) {
        let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
        return JSZip.loadAsync(content)
        .then(zip => {
          firmware = new Firmware(zip)
          return firmware.parseManifest()
        })
        .then(() => {
          done();
        })
      })

      beforeEach(function() {
        stateMachine = new StateMachine();
      })

      afterEach(function() {
        stateMachine = undefined;
      })


      it('fails when not configured', function() {
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).toThrowError("StateMachine is not configured with bluetooth characteristics");
      })

      it('fails when not idle', function() {
        stateMachine.state = States.TRANSFERING
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).toThrowError("Can only initate transfer when idle")
      })

      it('fails without firmware', function() {
        stateMachine.state = States.IDLE
        expect( function() {
          stateMachine.sendFirmware(null);
        }).toThrowError("Firmware needs to be of class Firmware");
      })

      it('succeed when idle and firmware is valid', function() {
        stateMachine.state = States.IDLE
        stateMachine.fileTransfers.pause()
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).not.toThrow();
      })

      it("addTransfers called", function() {
        stateMachine.state = States.IDLE
        stateMachine.fileTransfers.pause()
        let spyObject = spyOn(stateMachine, 'addTransfer');
        expect( function() {
          stateMachine.sendFirmware(firmware);
        }).not.toThrow();
        expect(spyObject.calls.count()).toBe(2);
      })

      it('progress should be incomplete', function() {
        stateMachine.state = States.IDLE
        stateMachine.fileTransfers.pause()
        stateMachine.sendFirmware(firmware);
        expect(stateMachine.progress()).not.toBe(1.0);
      })

    })

  })
})
*/
