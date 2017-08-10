'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _WriteMutations;

var _mutationTypes = require('../mutation-types');

var MutationTypes = _interopRequireWildcard(_mutationTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WriteMutations = (_WriteMutations = {}, (0, _defineProperty3.default)(_WriteMutations, MutationTypes.ADD_WRITE, function (state, write) {
  var writeIndex = state.writes.indexOf(write);
  if (writeIndex < 0) {
    state.writes.push(write);
  } else {
    state.writes.splice(writeIndex, 1, write);
  }
}), (0, _defineProperty3.default)(_WriteMutations, MutationTypes.UPDATE_WRITE, function (state, write) {
  var writeIndex = state.writes.indexOf(write);
  if (writeIndex >= 0) {
    state.writes.splice(writeIndex, 1, write);
  }
}), (0, _defineProperty3.default)(_WriteMutations, MutationTypes.REMOVE_WRITE, function (state, write) {
  var writeIndex = state.writes.indexOf(write);
  if (writeIndex >= 0) {
    state.writes.splice(writeIndex, 1);
  }
}), _WriteMutations);

exports.default = WriteMutations;
//# sourceMappingURL=write-mutations.js.map