import factory from 'factory-girl'
import WritesFactory from '../../factories/write-factory'

import { expect } from 'chai'
import sinon from 'sinon'
import WriteMutations from '../../../src/mutations/write-mutations'
import * as MutationTypes from '../../../src/mutation-types'

describe('WriteMutations', () => {
  let state
  let write
  let sandbox
  beforeEach(function (done) {
    state = {writes: []}
    sandbox = sinon.sandbox.create()
    factory.build('writeChecksum')
    .then((checksum) => {
      write = checksum
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe('#ADD_WRITE', function () {
    it('write added to queue', function () {
      WriteMutations[MutationTypes.ADD_WRITE](state,write)
      expect(state.writes.length).to.equal(1)
    })
    it('updates item if already in queue', function() {
      var spliceSpy = sandbox.spy(state.writes, "splice")
      state.writes.push(write)
      WriteMutations[MutationTypes.ADD_WRITE](state,write)
      expect(state.writes.length).to.equal(1)
      expect(spliceSpy.calledOnce).to.be.ok
    })
  })


  describe('#UPDATE_WRITE', function () {
    it('write added to queue', function () {
      state.writes.push(write)
      WriteMutations[MutationTypes.UPDATE_WRITE](state,write)
      expect(state.writes.length).to.equal(1)
    })
  })

  describe('#REMOVE_WRITE', function () {
    it('write added to queue', function () {
      state.writes.push(write)
      WriteMutations[MutationTypes.REMOVE_WRITE](state,write)
      expect(state.writes.length).to.equal(0)
    })
    it('write not added to queue', function () {
      var spliceSpy = sandbox.spy(state.writes, "splice")
      WriteMutations[MutationTypes.REMOVE_WRITE](state,write)
      expect(state.writes.length).to.equal(0)
      expect(spliceSpy.callCount).to.equal(0)
    })
  })

})
