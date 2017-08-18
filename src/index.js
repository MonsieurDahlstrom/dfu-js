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
import UpdateActions from './actions/update-actions'
import TransferActions from './actions/transfer-actions'
import ObjectActions from './actions/transfer-object-actions'
import WriteActions from './actions/write-actions'
//
import UpdateMutations from './mutations/update-mutations'
import TransferMutations from './mutations/transfer-mutations'
import ObjectMutations from './mutations/transfer-object-mutations'
import WriteMutations from './mutations/write-mutations'
//
import getters from './getters'
//
import {Firmware, FirmwareType} from './models/firmware'

const state = {
  updates: [],
  transfers: [],
  objects: [],
  writes: []
}

const actions = Object.assign({}, UpdateActions, TransferActions, ObjectActions, WriteActions)
const mutations = Object.assign({}, UpdateMutations, TransferMutations, ObjectMutations, WriteMutations)

const VuexModule = {
  state,
  getters,
  actions,
  mutations
}
module.exports.Firmware = Firmware
module.exports.FirmwareType = FirmwareType
module.exports.VuexModule = VuexModule
export default VuexModule
