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

  onEvent (store, dataView) {
    console.log('Transfer.onEvent')
    /** guard to filter events that are not response codes  */
    if(dataView.getInt8(0) !== Write.Actions.RESPONSE_CODE) {
      return
    }
    let opCode = dataView.getInt8(1)
    let responseCode = dataView.getInt8(2)
    /** Select returns the meta data needed to prepare the transfer and its transfer objects */
    if (opCode === Write.Actions.SELECT && responseCode === Write.Responses.SUCCESS) {
      let transferMetadata = {
        checksum: dataView.getUint32(11, true),
        offset: dataView.getUint32(7, true),
        maxiumSize: dataView.getUint32(3, true)
      }
      this.prepareTransfer(store, transferMetadata)
      return true
    } else {
      return false
    }
  }

  /**
  Given the type of device and object type, the maxium size that can be processed
  at a time varies. This method creates a set of TransferObject with this maxium size
  set.

  Secondly the device reports back how much of the file has been transfered and what the crc
  so far is. This method skips object that has already been completed
  **/
  prepareTransfer(store, metadata) {
    console.log('Transfer.prepareTransfer')
    let transfer = metadata.transfer
    let maxiumSize = metadata.maxiumSize
    let currentOffset = metadata.offset
    let currentCRC = metadata.checksum
    //
    transfer.maxObjectLength = maxiumSize
    transfer.objects = []
    transfer.currentObjectIndex = 0
    this.generateObjects(dispatch, transfer)
    /** Skip to object for the offset **/
    let object = transfer.objects.find((item) => item.hasOffset(currentOffset))
    if (object) {
      transfer.currentObjectIndex = transfer.objects.indexOf(object)
    }
    transfer.objects[transfer.currentObjectIndex].validate(store,metadata)
  }

  generateObjects(store) {
    console.log('Transfer.generateObjects')
    let fileBegin = 0
    let fileEnd = transfer.file.length
    let index = fileBegin
    while (index < fileEnd) {
      let objectBegin = index
      let objectEnd = objectBegin + transfer.maxObjectLength < fileEnd ? transfer.maxObjectLength : (fileEnd - index)
      let object = new TransferObject(objectBegin, objectEnd, transfer, transfer.objectType)
      object.transfer = transfer
      transfer.objects.push(object)
      store.dispatch('webBluetoothDFUObjectAdd', object)
      index += transfer.maxObjectLength
    }
  }
}

export default Transfer
