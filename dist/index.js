'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _updateActions = require('./actions/update-actions');

var _updateActions2 = _interopRequireDefault(_updateActions);

var _transferActions = require('./actions/transfer-actions');

var _transferActions2 = _interopRequireDefault(_transferActions);

var _transferObjectActions = require('./actions/transfer-object-actions');

var _transferObjectActions2 = _interopRequireDefault(_transferObjectActions);

var _writeActions = require('./actions/write-actions');

var _writeActions2 = _interopRequireDefault(_writeActions);

var _updateMutations = require('./mutations/update-mutations');

var _updateMutations2 = _interopRequireDefault(_updateMutations);

var _transferMutations = require('./mutations/transfer-mutations');

var _transferMutations2 = _interopRequireDefault(_transferMutations);

var _transferObjectMutations = require('./mutations/transfer-object-mutations');

var _transferObjectMutations2 = _interopRequireDefault(_transferObjectMutations);

var _writeMutations = require('./mutations/write-mutations');

var _writeMutations2 = _interopRequireDefault(_writeMutations);

var _getters = require('./getters');

var _getters2 = _interopRequireDefault(_getters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = {
  updates: [],
  transfers: [],
  objects: [],
  writes: []
};

var actions = (0, _assign2.default)({}, _updateActions2.default, _transferActions2.default, _transferObjectActions2.default, _writeActions2.default);
var mutations = (0, _assign2.default)({}, _updateMutations2.default, _transferMutations2.default, _transferObjectMutations2.default, _writeMutations2.default);

exports.default = {
  state: state,
  getters: _getters2.default,
  actions: actions,
  mutations: mutations
};
//# sourceMappingURL=index.js.map