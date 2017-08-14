module.exports = {
  'Demo test Google' : function (browser) {
    console.log(browser.keys());
    browser
      .url('http://localhost:3000')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('button[id=connect-device]', 1000)
      .windowHandle(function (event) {
        return browser.windowSize(event.value,500,500)
      })
      .click('button[id=connect-device]')
      .pause(2000)
      .keys(browser.keys.ESCAPE, function () {
        console.log('key pressed');
        browser
        .keys(browser.keys.ARROW_DOWN)
        .pause(2000)
        .getText("#device-list", function(result) {
          console.log(result.value)
        })
        .end();
      })
  }
};
