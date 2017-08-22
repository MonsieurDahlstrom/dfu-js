//Node Packages
import { expect } from 'chai'
import sinon from 'sinon'
//Factories build to test this library
import factory from '../../factories'
//Code to test
import UpdateMutations from '../../../../src/mutations/update-mutations'
import * as MutationTypes from '../../../../src/mutation-types'

describe('UpdateObject mutations', function () {

  beforeEach(function (done) {
    this.state = {updates: [], transfers: [], objects: [], writes: []}
    this.sandbox = sinon.sandbox.create()
    factory.build('update')
    .then((object) => {
      this.update = object
      done()
    })
  });
  afterEach(function () {
    this.sandbox.restore()
  });

  describe('#ADD_UPDATE', function () {
    it('transfer added to queue', function () {
      UpdateMutations[MutationTypes.ADD_UPDATE](this.state,this.update)
      expect(this.state.updates.length).to.equal(1)
    })
    it('updates item if already in queue', function() {
      var spliceSpy = this.sandbox.spy(this.state.updates, "splice")
      this.state.updates.push(this.update)
      UpdateMutations[MutationTypes.ADD_UPDATE](this.state,this.update)
      expect(this.state.updates.length).to.equal(1)
      expect(spliceSpy.calledOnce).to.be.ok
    })
  })

  describe('#MODIFED_UPDATE', function () {
    it('transfer added to queue', function () {
      var spliceSpy = this.sandbox.spy(this.state.updates, "splice")
      this.state.updates.push(this.update)
      UpdateMutations[MutationTypes.MODIFED_UPDATE](this.state,this.update)
      expect(this.state.updates.length).to.equal(1)
      expect(spliceSpy.calledOnce).to.be.ok
    })
  })

  describe('#REMOVE_UPDATE', function () {
    it('with no depedendents added', function () {
      this.state.updates.push(this.update)
      UpdateMutations[MutationTypes.REMOVE_UPDATE](this.state,this.update)
      expect(this.state.updates.length).to.equal(0)
    })
    it('with depedendents', function (done) {
      factory.buildMany('transfer', 2)
      .then(transferList => {
        transferList[0].update = this.update
        transferList[1].update = this.update
        this.state.transfers =  transferList
        return factory.buildMany('transferObject',2)
        .then(objectList => {
          objectList[0].transfer = transferList[0]
          objectList[1].transfer = transferList[1]
          this.state.objects = objectList
          return factory.buildMany('writeChecksum',2)
          .then(writeList => {
            writeList[0].transferObject = objectList[0]
            writeList[1].transferObject = objectList[1]
            this.state.writes = writeList
            UpdateMutations[MutationTypes.REMOVE_UPDATE](this.state,this.update)
            expect(this.state.updates.length).to.equal(0)
            expect(this.state.transfers.length).to.equal(0)
            expect(this.state.objects.length).to.equal(0)
            expect(this.state.writes.length).to.equal(0)
            done()
          })
        })
      })
    })
    it('not added to queue', function () {
      var spliceSpy = this.sandbox.spy(this.state.updates, "splice")
      UpdateMutations[MutationTypes.REMOVE_UPDATE](this.state,this.update)
      expect(this.state.updates.length).to.equal(0)
      expect(spliceSpy.callCount).to.equal(0)
    })
  })
})
