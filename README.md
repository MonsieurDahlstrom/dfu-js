# dfu-js
This JS library was build against [Nordic Semiconductors nRF SDK 12.3](https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v12.3.0%2Findex.html) using the [secure bootloader](https://infocenter.nordicsemi.com/topic/com.nordic.infocenter.sdk5.v12.3.0/ble_sdk_app_dfu_bootloader.html). The library requires Chrome 56 on Linux and Mac and Chrome 70 on Windows 10 which is partial support for Web Bluetooth was introduced. Other browswers have not fully or partially implemented Web Bluetooth.

The package also includes a Vue.js Mixin that sets up few useful computed properties. See this [gist](https://gist.github.com/mdahlstrom/08dacdb82ebe1e881b11e91a312dd6ac) of a vue component.

A demo web applicatiion using this library and [web-bluetooth-vuex](https://github.com/MonsieurDahlstrom/web-bluetooth-vuex.git) is available [here](https://monsieurdahlstrom.github.io/dfu-js/), Chrome only.

## Installation
```console
$ yarn add dfu-js
# OR
$ npm install dfu-js
```
## Usage
an semi pseduo code example on how to use the library straight.
```js
import {StateMachine, StateMachineStates, Firmware, DFUServiceUUID, DFUCharacteristicUUID} from 'dfu-js'
import JSZip from 'jszip'

/**
... Assume you discovered a ble device and aquired the service and
    characteristic needed. Servie uuid  DFUServiceUUID.DFU and characteristics
    DFUCharacteristicUUID.PacketPoint, DFUCharacteristicUUID.ControlPoint
**/

//Create a dfu object with the characteristics
const dfu = StateMachine(deviceControlPoint, devicePacketPoint)

/**
  load fileContentStream from a url or a local file
**/
const zip = new JSZip()
await zip.loadAsync(fileContentStream)
const dfuFirmware = new Firmware(zip)
await dfuFirmware.parseManifest()

/**
  Register for events fired by the dfu
**/
dfu.on('progressChanged', (payload) => console.log(payload))
dfu.on('stateChanged', (payload) => console.log(payload) )

/**
  Finally send the firmware update and await the callbacks to indicate
  sucess or failure. Besides the callvack the current state is expressed in
  dfu.state and dfu.progress
**/
dfu.sendFirmware(dfuFirmware)
```
