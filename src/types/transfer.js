
const TransferState = {
  Prepare: 0x00,
  Transfer: 0x01,
  Completed: 0x02,
  Failed: 0x03
}

class Transfer {
  constructor (fileData, controlPoint, packetPoint, objectType) {
    this.state = TransferState.Prepare
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this.packetPoint = packetPoint
    this.controlPoint = controlPoint
    /** Data array representing the actual file to transfer **/
    this.file = fileData
    /** The TransferObjectType this file represents */
    this.objectType = objectType
  }
}

module.exports.Transfer = Transfer
module.exports.TransferState = TransferState
