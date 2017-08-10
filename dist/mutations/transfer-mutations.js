'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _TransferMutations;

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

var _transmissionTypes = require('../models/transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TransferMutations = (_TransferMutations = {}, (0, _defineProperty3.default)(_TransferMutations, MutationTypes.ADD_TRANSFER, function (state, transfer) {
  var transferIndex = state.transfers.indexOf(transfer);
  if (transferIndex < 0) {
    state.transfers.push(transfer);
  } else {
    state.transfers.splice(transferIndex, 1, transfer);
  }
}), (0, _defineProperty3.default)(_TransferMutations, MutationTypes.UPDATE_TRANSFER, function (state, transfer) {
  var transferIndex = state.transfers.indexOf(transfer);
  if (transferIndex >= 0) {
    state.transfers.splice(transferIndex, 1, transfer);
  }
}), (0, _defineProperty3.default)(_TransferMutations, MutationTypes.REMOVE_TRANSFER, function (state, transfer) {
  var objectsToRemove = state.objects.filter(function (object) {
    return object.transfer === transfer;
  });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(objectsToRemove), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var object = _step.value;

      var writesToRemove = state.writes.filter(function (write) {
        return write.transferObject === object;
      });
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(writesToRemove), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var write = _step2.value;

          var writeIndex = state.writes.indexOf(write);
          if (writeIndex >= 0) {
            state.writes.splice(writeIndex, 1);
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var objectIndex = state.objects.indexOf(object);
      if (objectIndex >= 0) {
        state.objects.splice(objectIndex, 1);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var transferIndex = state.transfers.indexOf(transfer);
  if (transferIndex >= 0) {
    state.transfers.splice(transferIndex, 1);
  }
}), _TransferMutations);

exports.default = TransferMutations;
//# sourceMappingURL=transfer-mutations.js.map