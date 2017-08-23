import TransmissionStatus from '../transmission-types'
import WriteTypes from './write-types'

export class Write {
  constructor (dfuObject,characteristicToWriteTo, bytesToWrite, commandToExecute) {
    this.characteristic = characteristicToWriteTo
    this.bytes = bytesToWrite
    this.command = commandToExecute
    this.state = TransmissionStatus.Prepared
    this.error = undefined
    this.object = dfuObject
  }
}

export class Verify extends Write {
  constructor (dfuObject,characteristic,objectType) {
    let dataView = new DataView(new ArrayBuffer(2))
    dataView.setUint8(0, WriteTypes.SELECT)
    dataView.setUint8(1, objectType)
    super(dfuObject, characteristic, dataView.buffer, WriteTypes.SELECT);
  }
}

export class Create extends Write {
  constructor  (dfuObject, characteristic, objectType, length) {
    let dataView = new DataView(new ArrayBuffer(6))
    dataView.setUint8(0, WriteTypes.CREATE)
    dataView.setUint8(1, objectType)
    /** Data length set to little endian converstion */
    dataView.setUint32(2, length, true)
    super(dfuObject, characteristic, dataView.buffer, WriteTypes.CREATE);
  }
}

export class PacketReturnNotification extends Write {
  constructor (dfuObject, characteristic,packageCount) {
    let dataView = new DataView(new ArrayBuffer(3))
    dataView.setUint8(0, WriteTypes.SET_PRN)
    /** Set the package received notification to the number of expected packages */
    dataView.setUint16(1, packageCount, true)
    super(dfuObject, characteristic, dataView.buffer, WriteTypes.SET_PRN);

  }
}

export class Package extends Write {
  constructor (dfuObject, characteristic, buffer) {
    super(dfuObject, characteristic, buffer, undefined);
  }
}

export class Checksum extends Write {
  constructor (dfuObject,characteristic) {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, WriteTypes.CALCULATE_CHECKSUM)
    super(dfuObject, characteristic, dataView.buffer, WriteTypes.CALCULATE_CHECKSUM);
  }
}

export class Execute extends Write {
  constructor (dfuObject, characteristic) {
    let dataView = new DataView(new ArrayBuffer(1))
    dataView.setUint8(0, WriteTypes.EXECUTE)
    super(dfuObject, characteristic, dataView.buffer, WriteTypes.EXECUTE);
  }
}
