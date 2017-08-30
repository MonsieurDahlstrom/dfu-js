import {Firmware, FirmwareType} from '../models/firmware'
import {DFUStateMachine, DFUStateMachineStates} from '../models/state-machine'

const WebBluetoothDFU = {
	data: function() { return { dfuFirmware: undefined, dfuStateMachine: new DFUStateMachine(), dfuState: DFUStateMachineStates.NOT_CONFIGURED, dfuProgress: 0.0} },
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
      return this.dfuState === DFUStateMachineStates.IDLE
    },
    dfuInProgress: function () {
      return this.dfuState === DFUStateMachineStates.TRANSFERING
    },
    dfuCompleted: function () {
      return (this.dfuState === DFUStateMachineStates.COMPLETE || this.dfuState === DFUStateMachineStates.FAILED)
    }
  },
  methods: {
    firmwareFromZip: async function (zip) {
      console.log(zip)
      this.dfuFirmware = new Firmware(zip)
      await this.dfuFirmware.parseManifest()
      console.log(this.dfuFirmware)
    },
    performDFU: function() {
      this.dfuStateMachine.sendFirmware(this.dfuFirmware)
    },
    updateDFUState: function (payload) {
      this.dfuState = payload.state
    },
    updateDFUProgress: function (payload) {
      this.dfuProgress = payload.progress
    }
  }
}

export default WebBluetoothDFU
