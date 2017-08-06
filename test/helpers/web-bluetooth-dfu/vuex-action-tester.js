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

  run () {
    const  dispatch = this.dispatch
    const  commit = this.commit.bind(this)
    this.action({dispatch,commit}, this.payload)
    if (this.mutations.length === 0) {
      expect(this.count).to.equal(0)
      this.done()
    }
  }

  async commit (type,payload) {
    const mutation = this.mutations[this.count]
    try {
      expect(mutation.type).to.equal(type)
      if (payload && mutation.validation) {
        expect(mutation.validation(payload)).to.equal(true)
      }
    } catch (error) {
      this.done(error)
    }
    this.count++
    if (this.count >= this.mutations.length) {
      this.done()
    }
  }

}
