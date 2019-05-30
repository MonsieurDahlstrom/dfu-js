'use strict';

var _stateMachine = require('./models/state-machine');

var _firmware = require('./models/firmware');

var _webBluetoothDfu = require('./vue-mixins/web-bluetooth-dfu.js');

var _webBluetoothDfu2 = _interopRequireDefault(_webBluetoothDfu);

var _nordicSemiconductorDfu = require('./models/uuid/nordic-semiconductor-dfu');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
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

module.exports.StateMachineStates = _stateMachine.DFUStateMachineStates;
module.exports.StateMachine = _stateMachine.DFUStateMachine;
//
module.exports.Firmware = _firmware.Firmware;
module.exports.FirmwareTypes = _firmware.FirmwareType;
//
module.exports.DFUMixin = _webBluetoothDfu2.default;
module.exports.DFUServiceUUID = _nordicSemiconductorDfu.NordicSemiconductorServices;
module.exports.DFUCharacteristicUUID = _nordicSemiconductorDfu.NordicSemiconductorCharacteristics;