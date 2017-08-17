require "rubygems"
require "watir"
require 'minitest/autorun'
require 'java'

class TestDevicePicking < MiniTest::Unit::TestCase
  def setup
=begin
  # This is to load a remote instance on android device
    caps = Selenium::WebDriver::Remote::Capabilities.chrome(
      "chromeOptions" => { "androidPackage" => "com.android.chrome" }
    )
=end
    chromedriver_path = File.join(File.absolute_path(File.dirname(__FILE__)), '..', "chromedriver", "chromedriver.exe")
    Selenium::WebDriver::Chrome.driver_path = chromedriver_path
    #@browser = Watir::Browser.new :remote, url: "http://localhost:9515", desired_capabilities: caps
    args = ['--ignore-certificate-errors', '--disable-popup-blocking', '--disable-translate', '--enable-experimental-web-platform-features', '--enable-features=WebUSB']
    @browser = Watir::Browser.new :chrome,  options: {args: args}
    @robot = java.awt.Robot.new
  end

  def test_selectDevice
    #@browser.goto 'chrome://version'
    #@browser.goto 'chrome://flags/#enable-web-bluetooth'
    @browser.goto "https://10.21.1.17:3000"
    @browser.button(id: 'connect-device').wait_until_present
    @browser.button(id: 'connect-device').click
    sleep(5)
    @robot.keyPress(java.awt.event.KeyEvent::VK_TAB)
    @robot.keyPress(java.awt.event.KeyEvent::VK_DOWN)
  end

  def teardown
    log = @browser.driver.manage.logs.get(:browser)
    errors = log.select{ |entry| entry.level.eql? 'SEVERE' }
    if errors.count > 0
      javascript_errors = errors.map(&:message).join("\n")
      raise javascript_errors
    end
    @browser.close
  end
end
