import {expect} from 'chai'

export default class VuexActionTester {
  constructor(action, payload, mutations, dispatches, done) {
    this.action = action
    this.payload = payload
    this.state = {}
    this.mutations = mutations
    this.mutationsCount = 0
    this.dispatchesCount = 0
    this.dispatches = dispatches
    this.done = done
  }

  async run () {
    const  dispatch = this.dispatch.bind(this)
    const  commit = this.commit.bind(this)
    const error = undefined
    try {
      await this.action({dispatch,commit}, this.payload)
      expect(this.mutationsCount).to.equal(this.mutations.length)
      expect(this.dispatchesCount).to.equal(this.dispatches.length)
      this.done()
    } catch (e) {
      this.done(e)
    }
  }

  commit (type,payload) {
    if(this.mutations.length === 0) {
      throw Error('Expected no mutations')
    }
    const mutation = this.mutations[this.mutationsCount]
    if(mutation === undefined) {
      throw Error('Received more mutations then expected')
    }
    expect(mutation.type).to.equal(type)
    expect(mutation.validation(payload)).to.not.throw
    this.mutationsCount++
  }

  dispatch (type,payload) {
    if(this.dispatches.length === 0) {
      throw Error('Expected no dispatches')
    }
    const dispatch = this.dispatches[this.dispatchesCount]
    if(dispatch === undefined) {
      throw Error('Received more dispatches then expected')
    }
    expect(dispatch.type).to.equal(type)
    expect(dispatch.validation(payload)).to.not.throw
    this.dispatchesCount++
  }

}
