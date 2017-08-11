'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _update = require('./models/update');

var getters = {
  webBluetoothUpdateForDevice: function webBluetoothUpdateForDevice(state, getters) {
    return function (device) {
      return state.updates.find(function (update) {
        return update.identifier === device.id;
      });
    };
  },
  webBluetoothRunningUpdates: function webBluetoothRunningUpdates(state, getters) {
    return state.updates.filter(function (update) {
      return update.state === _update.UpdateStates.TRANSFERING;
    });
  },
  webBluetoothTransferForUpdate: function webBluetoothTransferForUpdate(state, getters) {
    return function (update) {
      return state.transfers.find(function (transfer) {
        return transfer.update === update && transfer.state === TransmissionStatus.Transfering;
      });
    };
  },
  webBluetoothObjectForTransfer: function webBluetoothObjectForTransfer(state, getters) {
    return function (transfer) {
      return state.objects.find(function (object) {
        return object.transfer === transfer && object.state === TransmissionStatus.Transfering;
      });
    };
  },
  webBluetoothWriteForObject: function webBluetoothWriteForObject(state, getters) {
    return function (object) {
      return state.actions.find(function (action) {
        return action.object === object && action.state === TransmissionStatus.Transfering;
      });
    };
  }
};

exports.default = getters;
//# sourceMappingURL=getters.js.map