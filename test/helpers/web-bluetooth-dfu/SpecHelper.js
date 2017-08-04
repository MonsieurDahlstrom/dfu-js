beforeAll(function() {
  this.executeAsyncMethod = function(runAsync) {
    return (done) => {
      runAsync()
      .then(done, e => {
        fail(e);
        done();
      })
    };
  }
})
