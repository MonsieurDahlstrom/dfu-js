import TransmissionStatus from './transmission-types'

class Transfer {

  constructor (fileData, controlPoint, packetPoint, objectType) {
    this.state = TransmissionStatus.Prepare
    /** The WebBluetooth Characteristics needed to transfer a file **/
    this.packetPoint = packetPoint
    this.controlPoint = controlPoint
    /** Data array representing the actual file to transfer **/
    this.file = fileData
    /** The TransferObjectType this file represents */
    this.objectType = objectType
    /** reference to wrapper function around control point events**/
    this.controlPointEventHandler = undefined
    /** reference to parent transfer**/
    this.update = undefined
  }

}

module.exports.Transfer = Transfer
export default Transfer
