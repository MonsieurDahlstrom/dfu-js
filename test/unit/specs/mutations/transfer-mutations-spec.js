//Node Packages
import { expect } from 'chai'
import sinon from 'sinon'
//Factories build to test this library
import factory from '../../factories'
//Code to test
import TransferMutations from '../../../../src/mutations/transfer-mutations'
import * as MutationTypes from '../../../../src/mutation-types'

describe('TransferObject mutations', function () {

  let state
  let transfer
  let sandbox
  beforeEach(function (done) {
    state = {transfers: [], objects: [], writes: []}
    sandbox = sinon.sandbox.create()
    factory.build('transfer')
    .then((object) => {
      transfer = object
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe('#ADD_TRANSFER', function () {
    it('transfer added to queue', function () {
      TransferMutations[MutationTypes.ADD_TRANSFER](state,transfer)
      expect(state.transfers.length).to.equal(1)
    })
    it('updates item if already in queue', function() {
      var spliceSpy = sandbox.spy(state.transfers, "splice")
      state.transfers.push(transfer)
      TransferMutations[MutationTypes.ADD_TRANSFER](state,transfer)
      expect(state.transfers.length).to.equal(1)
      expect(spliceSpy.calledOnce).to.be.ok
    })
  })


  describe('#UPDATE_TRANSFER', function () {
    it('transfer added to queue', function () {
      state.transfers.push(transfer)
      TransferMutations[MutationTypes.UPDATE_TRANSFER](state,transfer)
      expect(state.transfers.length).to.equal(1)
    })
  })

  describe('#REMOVE_TRANSFER', function () {
    it('transfer added to queue', function () {
      state.transfers.push(transfer)
      TransferMutations[MutationTypes.REMOVE_TRANSFER](state,transfer)
      expect(state.transfers.length).to.equal(0)
    })
    it('transfer added to queue with depedendent writes', function (done) {
      factory.build('transferObject')
      .then((object) => {
        object.transfer = transfer
        state.objects.push(object)
        factory.buildMany('writeChecksum', 5)
        .then((list) => {
          for (var write of list) {
            write.transferObject = object
            state.writes.push(write)
          }
          state.transfers.push(transfer)
          TransferMutations[MutationTypes.REMOVE_TRANSFER](state,transfer)
          expect(state.transfers.length).to.equal(0)
          expect(state.objects.length).to.equal(0)
          expect(state.writes.length).to.equal(0)
          done()
        })
      })
    })
    it('transfer not added to queue', function () {
      var spliceSpy = sandbox.spy(state.transfers, "splice")
      TransferMutations[MutationTypes.REMOVE_TRANSFER](state,transfer)
      expect(state.transfers.length).to.equal(0)
      expect(spliceSpy.callCount).to.equal(0)
    })
  })

})
