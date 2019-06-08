import readFirmwareFromFS from './prepared-firmware.js'
import {StateMachineStates as DFUStateMachineStates, StateMachine as DFUStateMachine} from '../../../src/models/state-machine'
import {expect} from 'chai'

/**
Expecting the testContext to have created a sinon sandbox and created the statemachine
**/
const testFirmwareAtPath = function (testZipPath) {
  beforeEach(async function() {
    await readFirmwareFromFS(this,testZipPath)
  })
  afterEach(function () {
    this.firmware = undefined
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
    this.stateMachine.queue.pause()
    expect( () => this.stateMachine.sendFirmware(this.firmware) ).to.not.throw();
  })

  it("addTransfers called", function() {
    this.stateMachine.state = DFUStateMachineStates.IDLE
    this.stateMachine.queue.pause()
    let spyObject = this.sandbox.spy(this.stateMachine, 'addTransfer');
    expect( () => this.stateMachine.sendFirmware(this.firmware) ).to.not.throw();
    expect(spyObject.calledTwice).to.be.true
  })

  it('progress should be incomplete', function() {
    this.stateMachine.state = DFUStateMachineStates.IDLE
    this.stateMachine.queue.pause()
    this.stateMachine.sendFirmware(this.firmware);
    expect(this.stateMachine.progress).not.to.equal(1.0);
  })

}

export default testFirmwareAtPath
