require "rubygems"
require "watir"
require 'minitest/autorun'
require 'java'
require 'os'

class TestDevicePicking < MiniTest::Unit::TestCase
  def setup
=begin
  # This is to load a remote instance on android device
    caps = Selenium::WebDriver::Remote::Capabilities.chrome(
      "chromeOptions" => { "androidPackage" => "com.android.chrome" }
    )
=end
    chromedriver_path = File.join(File.absolute_path(File.dirname(__FILE__)), '..', "chromedriver", "chromedriver.exe") if OS.windows?
    chromedriver_path = File.join(File.absolute_path(File.dirname(__FILE__)), '..', "chromedriver", "chromedriver_macos") if OS.mac?
    Selenium::WebDriver::Chrome.driver_path = chromedriver_path
    #@browser = Watir::Browser.new :remote, url: "http://localhost:9515", desired_capabilities: caps
    args = ['--ignore-certificate-errors', '--disable-popup-blocking', '--disable-translate', '--enable-experimental-web-platform-features', '--enable-features=WebUSB']
    @browser = Watir::Browser.new :chrome,  options: {args: args}
    @robot = java.awt.Robot.new
  end

  def test_selectDevice
    #@browser.goto 'chrome://version'
    #@browser.goto 'chrome://flags/#enable-web-bluetooth'
    #oascript
    @browser.goto "https://localhost:3000"
    if OS.mac?
      bring_chrome_to_front = %Q{ osascript -e "tell application \\\"Google Chrome\\\" to activate" }
      move_chrome = %Q{ osascript -e "tell application \\\"Google Chrome\\\"" -e "set position of front window to {1, 1}" -e "end tell"}
      `#{bring_chrome_to_front}`
      `#{move_chrome}`
    end
    puts @browser.window
    @browser.window.move_to(-1200,0)
    @browser.button(id: 'connect-device').wait_until_present
    @browser.send_keys :control, :command, 'f'
    @browser.button(id: 'connect-device').click
    sleep(2)
=begin
    @robot.mouseMove(963,10);
    # a slow click here so you can see what's happening
    @robot.delay(1000);
    @robot.mousePress(java.awt.event.InputEvent::BUTTON1_MASK);
    @robot.delay(1000);
    @robot.mouseRelease(java.awt.event.InputEvent::BUTTON1_MASK);
=end
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
