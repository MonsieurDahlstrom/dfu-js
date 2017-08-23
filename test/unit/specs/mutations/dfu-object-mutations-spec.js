//Node Packages
import { expect } from 'chai'
import sinon from 'sinon'
//Factories build to test this library
import factory from '../../factories'
//Code to test
import TransferObjectMutations from '../../../../src/mutations/dfu-object-mutations'
import * as MutationTypes from '../../../../src/mutation-types'

describe('TransferObject mutations', function () {

  let state
  let transferObject
  let sandbox
  beforeEach(function (done) {
    state = {objects: [], writes: []}
    sandbox = sinon.sandbox.create()
    factory.build('transferObject')
    .then((object) => {
      transferObject = object
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe('#ADD_TRANSFER_OBJECT', function () {
    it('transferObject added to queue', function () {
      TransferObjectMutations[MutationTypes.ADD_DFU_OBJECT](state,transferObject)
      expect(state.objects.length).to.equal(1)
    })
    it('updates item if already in queue', function() {
      var spliceSpy = sandbox.spy(state.objects, "splice")
      state.objects.push(transferObject)
      TransferObjectMutations[MutationTypes.ADD_DFU_OBJECT](state,transferObject)
      expect(state.objects.length).to.equal(1)
      expect(spliceSpy.calledOnce).to.be.ok
    })
  })


  describe('#UPDATE_TRANSFER_OBJECT', function () {
    it('transferObject added to queue', function () {
      state.objects.push(transferObject)
      TransferObjectMutations[MutationTypes.UPDATE_DFU_OBJECT](state,transferObject)
      expect(state.objects.length).to.equal(1)
    })
  })

  describe('#REMOVE_TRANSFER_OBJECT', function () {
    it('transferObject added to queue', function () {
      state.objects.push(transferObject)
      TransferObjectMutations[MutationTypes.REMOVE_DFU_OBJECT](state,transferObject)
      expect(state.objects.length).to.equal(0)
    })
    it('transferObject added to queue with depedendent writes', function (done) {
      factory.buildMany('writeChecksum', 5)
      .then((list) => {
        for (var write of list) {
          write.transferObject = transferObject
          state.writes.push(write)
        }
        state.objects.push(transferObject)
        TransferObjectMutations[MutationTypes.REMOVE_DFU_OBJECT](state,transferObject)
        expect(state.objects.length).to.equal(0)
        expect(state.writes.length).to.equal(0)
        done()
      })

    })
    it('transferObject not added to queue', function () {
      var spliceSpy = sandbox.spy(state.objects, "splice")
      TransferObjectMutations[MutationTypes.REMOVE_DFU_OBJECT](state,transferObject)
      expect(state.objects.length).to.equal(0)
      expect(spliceSpy.callCount).to.equal(0)
    })
  })

})
