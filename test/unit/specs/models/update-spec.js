import {expect} from 'chai'
//
import factory from '../../factories'
//
import {Update, UpdateStates} from '../../../../src/models/update'

describe('Update', function () {

  describe('#constructor', function () {
    describe('without characteristics', function () {
      beforeEach(function () {
        this.update = new Update()
      })
      afterEach(function () {
        this.update = undefined
      })
      it('initalised object', function () {
        expect(this.update instanceof Update).to.be.true
      })
      it('is unconfigured', function () {
        expect(this.update.state).to.equal(UpdateStates.NOT_CONFIGURED)
      })
    })
    describe('without characteristics', function () {
      beforeEach(function (done) {
        factory.buildMany('webBluetoothCharacteristic', 2)
        .then((list) => {
          this.update = new Update('name', list[0], list[1])
          done()
        })
      })
      afterEach(function () {
        this.update = undefined
      })
      it('initalised object', function () {
        expect(this.update instanceof Update).to.be.true
      })
      it('is unconfigured', function () {
        expect(this.update.state).to.equal(UpdateStates.IDLE)
      })
    })
  })
})
