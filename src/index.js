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

import {DFUStateMachine,DFUStateMachineStates} from './models/state-machine'
import {Firmware, FirmwareType} from './models/firmware'
import WebBluetoothDFU from './vue-mixins/web-bluetooth-dfu.js'
import {NordicSemiconductorServices,NordicSemiconductorCharacteristics} from './models/uuid/nordic-semiconductor-dfu'
//
module.exports.StateMachineStates = DFUStateMachineStates
module.exports.StateMachine = DFUStateMachine
//
module.exports.Firmware = Firmware
module.exports.FirmwareTypes = FirmwareType
//
module.exports.DFUMixin = WebBluetoothDFU
module.exports.DFUServiceUUID = NordicSemiconductorServices
module.exports.DFUCharacteristicUUID = NordicSemiconductorCharacteristics
