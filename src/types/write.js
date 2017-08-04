import TransmissionStatus from './transmission-types'
import WriteTypes from './write-types'

export class Write {
  constructor (characteristicToWriteTo, bytesToWrite, commandToExecute) {
    this.characteristic = characteristicToWriteTo
    this.bytes = bytesToWrite
    this.command = commandToExecute
    this.state = TransmissionStatus.Prepared
    this.error = undefined
  }
}

export class Verify extends Write {
  constructor (characteristic,objectType) {
    if (typeof(objectType) !== 'number') {
      throw new TypeError("object type is not a number")
    }
    if (typeof(characteristic) !== 'object') {
      throw new TypeError('characteristic is undefined')
    }
    let dataView = new DataView(new ArrayBuffer(2))
    dataView.setUint8(0, WriteTypes.SELECT)
    dataView.setUint8(1, objectType)
    super(characteristic, dataView.buffer, WriteTypes.SELECT);
  }
}

export class Create extends Write {
  constructor  (characteristic, objectType, length) {
    if (typeof(length) !== 'number') {
      throw new TypeError('object length is not a number')
    }
    if (typeof(objectType) !== 'number') {
      throw new TypeError("object type is not a number")
    }
    if (typeof(characteristic) !== 'object') {
      throw new TypeError('characteristic is not an object')
    }
    let dataView = new DataView(new ArrayBuffer(6))
    dataView.setUint8(0, WriteTypes.CREATE)
    dataView.setUint8(1, objectType)
    /** Data length set to little endian converstion */
    dataView.setUint32(2, length, true)
    super(characteristic, dataView.buffer, WriteTypes.CREATE);
  }
}

export class PacketReturnNotification extends Write {
  constructor (characteristic,packageCount) {
    if (typeof(packageCount) !== 'number') {
      throw new TypeError("package count is not provided")
    }
    if (characteristic === undefined) {
      throw new TypeError('characteristic is undefined')
    }
    let dataView = new DataView(new ArrayBuffer(3))
    dataView.setUint8(0, WriteTypes.SET_PRN)
    /** Set the package received notification to the number of expected packages */
    dataView.setUint16(1, packageCount, true)
    super(characteristic, dataView.buffer, WriteTypes.SET_PRN);

  }
}

export class Package extends Write {
  constructor (characteristic, buffer) {
    if (typeof(buffer) !== 'object') {
      throw new TypeError("buffer is not provided")
    }
    if (typeof(characteristic) !== 'object') {
      throw new TypeError('characteristic is undefined')
    }
    super(characteristic, buffer, undefined);
  }
}

export class Checksum extends Write {
  constructor (characteristic) {
    if (typeof(characteristic) !== 'object') {
      throw new TypeError('characteristic is not an object')
    }
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, WriteTypes.CALCULATE_CHECKSUM)
    super(characteristic, dataView.buffer, WriteTypes.CALCULATE_CHECKSUM);
  }
}

export class Execute extends Write {
  constructor (characteristic) {
    if (typeof(characteristic) !== 'object') {
      throw new TypeError('characteristic is not an object')
    }
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, WriteTypes.EXECUTE)
    super(characteristic, dataView.buffer, WriteTypes.EXECUTE);

  }
}
