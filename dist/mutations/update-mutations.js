'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _UpdateMutations;

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

var _transmissionTypes = require('../models/transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UpdateMutations = (_UpdateMutations = {}, (0, _defineProperty3.default)(_UpdateMutations, MutationTypes.ADD_UPDATE, function (state, update) {
  var updateIndex = state.updates.indexOf(update);
  if (updateIndex < 0) {
    state.updates.push(update);
  } else {
    state.updates.splice(updateIndex, 1, update);
  }
}), (0, _defineProperty3.default)(_UpdateMutations, MutationTypes.MODIFY_UPDATE, function (state, update) {
  var updateIndex = state.updates.indexOf(update);
  if (updateIndex >= 0) {
    state.updates.splice(updateIndex, 1, update);
  }
}), (0, _defineProperty3.default)(_UpdateMutations, MutationTypes.REMOVE_UPDATE, function (state, update) {
  var transfersToRemove = state.transfers.filter(function (transfer) {
    return transfer.update === update;
  });

  var objectsToRemove = state.objects.filter(function (object) {
    return transfersToRemove.includes(object.transfer);
  });

  var writesToRemove = state.writes.filter(function (write) {
    return objectsToRemove.includes(write.transferObject);
  });
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(writesToRemove), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var write = _step.value;

      var writeIndex = state.writes.indexOf(write);
      if (writeIndex >= 0) {
        state.writes.splice(writeIndex, 1);
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = (0, _getIterator3.default)(objectsToRemove), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var object = _step2.value;

      var objectIndex = state.objects.indexOf(object);
      if (objectIndex >= 0) {
        state.objects.splice(objectIndex, 1);
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

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = (0, _getIterator3.default)(transfersToRemove), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var transfer = _step3.value;

      var transferIndex = state.transfers.indexOf(transfer);
      if (transferIndex >= 0) {
        state.transfers.splice(transferIndex, 1);
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var updateIndex = state.updates.indexOf(update);
  if (updateIndex >= 0) {
    state.updates.splice(updateIndex, 1);
  }
}), _UpdateMutations);

exports.default = UpdateMutations;
//# sourceMappingURL=update-mutations.js.map