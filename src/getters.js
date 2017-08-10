import {Update, UpdateStates} from './models/update'

const getters = {
  webBluetoothUpdateForDevice: (state, getters) => (device) => {
    return state.updates.find(update => update.identifier === device.id)
  },
  webBluetoothRunningUpdates: (state, getters) => state.updates.filter((update) => update.state === UpdateStates.TRANSFERING),
  webBluetoothTransferForUpdate: (state, getters) => (update) => state.transfers.find((transfer) => transfer.update === update && transfer.state === TransmissionStatus.Transfering),
  webBluetoothObjectForTransfer: (state, getters) => (transfer) => state.objects.find((object) => object.transfer === transfer && object.state === TransmissionStatus.Transfering),
  webBluetoothWriteForObject: (state, getters) => (object) => state.actions.find((action) => action.object === object && action.state === TransmissionStatus.Transfering)
}

export default getters
