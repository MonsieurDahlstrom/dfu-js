// Copyright (c) 2017 Monsieur Dahlström Ltd
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

import {Firmware, FirmwareType} from '../models/firmware'
import {StateMachine, StateMachineStates} from '../models/state-machine'

const WebBluetoothDFU = {
	data: function() { return { dfuFirmware: undefined, dfuStateMachine: new StateMachine(), dfuState: StateMachineStates.NOT_CONFIGURED, dfuProgress: 0.0} },
  created: function () {
    this.dfuStateMachine.on('progressChanged', this.updateDFUProgress)
    this.dfuStateMachine.on('stateChanged', this.updateDFUState)
    // `this` points to the vm instance
    this.dfuStateMachine.controlPoint = this.webBluetoothControlPoint
    this.dfuStateMachine.packetPoint = this.webBluetoothPacketPoint
  },
  computed: {
    webBluetoothControlPoint: function () {
      throw new Error('DFUMixin expects component to provide computed property webBluetoothControlPoint')
    },
    webBluetoothPacketPoint: function () {
      throw new Error('DFUMixin expects component to provide computed property webBluetoothPacketPoint')
    },
    dfuIdle: function () {
      return this.dfuState === StateMachineStates.IDLE
    },
    dfuInProgress: function () {
      return this.dfuState === StateMachineStates.TRANSFERING
    },
    dfuCompleted: function () {
      return this.dfuState === StateMachineStates.COMPLETE
    },
		dfuFailed: function () {
      return this.dfuState === StateMachineStates.FAILED
    }
  },
  methods: {
    firmwareFromZip: async function (zip) {
      this.dfuFirmware = new Firmware(zip)
      await this.dfuFirmware.parseManifest()
    },
		resetDFU: function() {
			this.dfuStateMachine.reset()
		},
    performDFU: function() {
      this.dfuStateMachine.sendFirmware(this.dfuFirmware)
    },
    updateDFUState: function (payload) {
      this.dfuState = payload.state
    },
    updateDFUProgress: function (payload) {
			var num = new Number(this.dfuStateMachine.progress.completed / this.dfuStateMachine.progress.size);
			this.dfuProgress = num.toFixed(2)
    }
  },
	watch: {
    webBluetoothPacketPoint(val) {
      this.dfuStateMachine.packetPoint = val
    },
    webBluetoothControlPoint(val) {
      this.dfuStateMachine.controlPoint = val
    }
  }
}

export default WebBluetoothDFU
