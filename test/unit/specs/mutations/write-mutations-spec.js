import factory from '../../factories'

import { expect } from 'chai'
import sinon from 'sinon'
import WriteMutations from '../../../../src/mutations/write-mutations'
import * as MutationTypes from '../../../../src/mutation-types'

describe.only('WriteMutations', () => {
  before(function () {
    this.sandbox = sinon.sandbox.create()
  })
  beforeEach(function (done) {
    this.state = {writes: []}
    factory.build('writeChecksum')
    .then((checksum) => {
      this.write = checksum
      done()
    })
  });
  afterEach(function () {
    this.sandbox.restore()
  });

  describe('#ADD_WRITE', function () {
    it('write added to queue', function () {
      WriteMutations[MutationTypes.ADD_WRITE](this.state,this.write)
      expect(this.state.writes.length).to.equal(1)
    })
    it('updates item if already in queue', function() {
      var spliceSpy = this.sandbox.spy(this.state.writes, "splice")
      this.state.writes.push(this.write)
      WriteMutations[MutationTypes.ADD_WRITE](this.state,this.write)
      expect(this.state.writes.length).to.equal(1)
      expect(spliceSpy.calledOnce).to.be.ok
    })
  })


  describe('#UPDATE_WRITE', function () {
    it('write added to queue', function () {
      this.state.writes.push(this.write)
      WriteMutations[MutationTypes.UPDATE_WRITE](this.state,this.write)
      expect(this.state.writes.length).to.equal(1)
    })
  })

  describe('#REMOVE_WRITE', function () {
    it('write added to queue', function () {
      this.state.writes.push(this.write)
      WriteMutations[MutationTypes.REMOVE_WRITE](this.state,this.write)
      expect(this.state.writes.length).to.equal(0)
    })
    it('write not added to queue', function () {
      var spliceSpy = this.sandbox.spy(this.state.writes, "splice")
      WriteMutations[MutationTypes.REMOVE_WRITE](this.state,this.write)
      expect(this.state.writes.length).to.equal(0)
      expect(spliceSpy.callCount).to.equal(0)
    })
  })

})
