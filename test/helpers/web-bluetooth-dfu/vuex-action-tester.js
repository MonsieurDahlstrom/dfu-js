import {expect} from 'chai'

export default class VuexActionTester {
  constructor(action, payload, state, mutations, done) {
    this.action = action
    this.payload = payload
    this.state = state
    this.mutations = mutations
    this.done = done
    this.count = 0
    this.dispatch = {}
  }

  async run () {
    const  dispatch = this.dispatch
    const  commit = this.commit.bind(this)
    try {
      await this.action({dispatch,commit}, this.payload)
      expect(this.count).to.equal(this.mutations.length)
      this.done()
    } catch (e) {
      this.done(e)
    }
  }

  async commit (type,payload) {
    if(this.mutations.length === 0) {
      throw Error('Expected no mutations')
    }
    const mutation = this.mutations[this.count]
    expect(mutation.type).to.equal(type)
    expect(mutation.validation(payload)).to.equal(true)
    this.count++
  }

}
