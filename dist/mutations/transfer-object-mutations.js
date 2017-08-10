'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _TransferObjectMutati;

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

var _transmissionTypes = require('../models/transmission-types');

var _transmissionTypes2 = _interopRequireDefault(_transmissionTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TransferObjectMutations = (_TransferObjectMutati = {}, (0, _defineProperty3.default)(_TransferObjectMutati, MutationTypes.ADD_TRANSFER_OBJECT, function (state, transferObject) {
  var objectIndex = state.objects.indexOf(transferObject);
  if (objectIndex < 0) {
    state.objects.push(transferObject);
  } else {
    state.objects.splice(objectIndex, 1, transferObject);
  }
}), (0, _defineProperty3.default)(_TransferObjectMutati, MutationTypes.UPDATE_TRANSFER_OBJECT, function (state, transferObject) {
  var objectIndex = state.objects.indexOf(transferObject);
  if (objectIndex >= 0) {
    state.objects.splice(objectIndex, 1, transferObject);
  }
}), (0, _defineProperty3.default)(_TransferObjectMutati, MutationTypes.REMOVE_TRANSFER_OBJECT, function (state, transferObject) {
  var writesToRemove = state.writes.filter(function (write) {
    return write.transferObject === transferObject;
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

  var objectIndex = state.objects.indexOf(transferObject);
  if (objectIndex >= 0) {
    state.objects.splice(objectIndex, 1);
  }
}), _TransferObjectMutati);

exports.default = TransferObjectMutations;
//# sourceMappingURL=transfer-object-mutations.js.map