'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _update = require('./models/update');

var getters = {
  webBluetoothUpdateForDevice: function webBluetoothUpdateForDevice(state) {
    return function (device) {
      return state.updates.find(function (item) {
        return item.id === device.id;
      });
    };
  },
  webBluetoothRunningUpdates: function webBluetoothRunningUpdates(state) {
    return state.updates.filter(function (update) {
      return update.state === _update.UpdateStates.TRANSFERING;
    });
  },
  webBluetoothTransferForUpdate: function webBluetoothTransferForUpdate(state) {
    return function (update) {
      return state.transfers.find(function (transfer) {
        return transfer.update === update && transfer.state === TransmissionStatus.Transfering;
      });
    };
  },
  webBluetoothObjectForTransfer: function webBluetoothObjectForTransfer(state) {
    return function (transfer) {
      return state.objects.find(function (object) {
        return object.transfer === transfer && object.state === TransmissionStatus.Transfering;
      });
    };
  },
  webBluetoothWriteForObject: function webBluetoothWriteForObject(state) {
    return function (object) {
      return state.actions.find(function (action) {
        return action.object === object && action.state === TransmissionStatus.Transfering;
      });
    };
  }
};

exports.default = getters;
//# sourceMappingURL=getters.js.map