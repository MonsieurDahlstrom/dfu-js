import * as MutationTypes from '../mutation-types'

const TransferObjectActions = {

  /** Adding a TransferObject to the vuex state **/
  async webBluetoothDFUObjectAdd({ dispatch, commit }, dfuObject) {
    commit(MutationTypes.ADD_DFU_OBJECT, dfuObject)
  },

  /* Remove a TransferObject from the vuex state */
  async webBluetoothDFUObjectUpdated({ dispatch, commit }, dfuObject) {
    commit(MutationTypes.UPDATE_DFU_OBJECT, dfuObject)
  },

  /* Remove a TransferObject from the vuex state */
  async webBluetoothDFUObjectRemove({ dispatch, commit }, dfuObject) {
    commit(MutationTypes.REMOVE_DFU_OBJECT, dfuObject)
  }
}

/** The first step in transferring this object, ask how much has already been transferred
async webBluetoothDFUObjectBegin({ dispatch, commit }, transferObject) {
  transferObject.state = TransferObjectState.Creating
  let write = new Write.Verify(transferObject.type,transferObject.transfer.controlPoint)
  write.transferObject = transferObject
  dispatch('webBluetoothDFUScheduleWrite',write)
  dispatch('webBluetoothDFUExecuteWrite', write)
  commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
}
**/

/**
  Internal convinence methods, a transfer object might have been partially
  transfered already, if so the offset passed in as none zero.

  Based on the offset and length into the Transfer objects file and the given
  offset in this range, create the number of chunks needed.

async webBluetoothDFUObjectToPackets({ dispatch, commit }, payload) {
  console.log('  webBluetoothDFUObjectToPackets')
  console.log(payload)
  let transferObject = payload.transferObject
  let offset = payload.offset
  let parentFileEnd = transferObject.offset + transferObject.length
  let parentFileBegin = transferObject.offset + offset
  let index = parentFileBegin
  while (index < parentFileEnd) {
    let chunkBegin = index
    let chunkEnd = chunkBegin + DATA_CHUNK_SIZE < parentFileEnd ? chunkBegin + DATA_CHUNK_SIZE : chunkBegin + (parentFileEnd - index)
    let chunk = transferObject.transfer.file.slice(chunkBegin, chunkEnd)
    transferObject.chunks.push(chunk)
    index += DATA_CHUNK_SIZE
  }
  commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
},
**/

/** Slots all data chunks for transmission, the queue inside Transfer ensures the order
async webBluetoothDFUObjectTransferDataPackages({ dispatch, commit }, transferObject) {
  console.log('  webBluetoothDFUObjectTransferDataPackages');
  for (let index = 0; index < transferObject.chunks.length; index++) {
    let buffer = transferObject.chunks[index]
    let write = new Write.Package(transferObject.transfer.packetPoint, buffer)
    write.transferObject = transferObject
    await dispatch('webBluetoothDFUScheduleWrite', write)
    await dispatch('webBluetoothDFUExecuteWrite', write)
  }
  commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
},
**/

/** Given an offset & checksum, take the appropirate next action
async webBluetoothDFUObjectValidate({ dispatch, commit }, payload) {
  console.log('  webBluetoothDFUObjectValidate')
  var transferObject = payload.transferObject
  var offset = payload.offset
  var checksum = payload.checksum
  // The checksum reported back from a NRF51/52 is a crc of the Transfer object's file up till the offset
  let fileCRCToOffset = crc.crc32(transferObject.transfer.file.slice(0, offset))
  if (offset === transferObject.offset + transferObject.length && checksum === fileCRCToOffset) {
    console.log('    Transfer complete')
    // Object has been transfered and should be moved into its right place on the device
    transferObject.state = TransferObjectState.Storing
    let write = new Write.Execute(transferObject.transfer.packetPoint)
    write.transferObject = transferObject
    dispatch('webBluetoothDFUScheduleWrite', write)
  } else if (offset === transferObject.offset || offset > transferObject.offset + transferObject.length || checksum !== fileCRCToOffset) {
    console.log('    Transfer needs to be created')
    // This object has not been trasnfered to the device or is faulty, recreate and transfer a new
    transferObject.state = TransferObjectState.Creating
    let write = new Write.Create(transferObject.transfer.controlPoint,transferObject.type,transferObject.length)
    write.transferObject = transferObject
    dispatch('webBluetoothDFUScheduleWrite', write)
  } else {
    console.log('    Initiate package transfer')
    // its the right object on the device but it has not been transfred fully
    transferObject.state = TransferObjectState.Transfering
    dispatch('webBluetoothDFUObjectToPackets', {transferObject:transferObject, offset:offset})
    dispatch('webBluetoothDFUObjectSetPacketReturnNotification', transferObject)
    dispatch('webBluetoothDFUObjectTransferDataPackages', transferObject)
  }
  commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
}
**/

/** Request a notification when all packets for this transferObject has been received on the device
async webBluetoothDFUObjectSetPacketReturnNotification({ dispatch, commit }, transferObject) {
  console.log('  webBluetoothDFUObjectSetPacketReturnNotification');
  let write = new Write.PacketReturnNotification(transferObject.transfer.packetPoint,transferObject.chunks.length)
  write.transferObject = transferObject
  dispatch('webBluetoothDFUScheduleWrite', write)
  commit(MutationTypes.UPDATE_TRANSFER_OBJECT, transferObject)
}
**/

/** handles events received on the Control Point Characteristic
async webBluetoothDFUObjectHandleEvent ({ dispatch, commit }, payload) {
  console.log('  webBluetoothDFUObjectHandleEvent');
  let dataView = payload.dataView
  let transferObject = payload.transferObject
  // Depending on which state this object is handle the relevent opcodes
  payload.opCode = dataView.getInt8(1)
  payload.responseCode = dataView.getInt8(2)
  switch (transferObject.state) {
    case TransferObjectState.Creating:
      dispatch('webBluetoothDFUObjectHandleEventWhileCreating', payload)
      break
    case TransferObjectState.Transfering:
      dispatch('webBluetoothDFUObjectHandleEventWhileTransfering', payload)
      break
    case TransferObjectState.Storing: {
      dispatch('webBluetoothDFUObjectHandleEventWhileStoring', payload)
      break
    }
  }
}
**/

/*
async webBluetoothDFUObjectHandleEventWhileCreating ({ dispatch, commit }, payload) {
  console.log('  webBluetoothDFUObjectHandleEventWhileCreating')
  if (payload.opCode === Write.Actions.SELECT && payload.responseCode === Write.Responses.SUCCESS) {
    console.log('    SELECT SUCCESS')
    // verify how much how the transfer that has been completed
    payload.offset = payload.dataView.getUint32(7, true)
    payload.checksum = payload.dataView.getUint32(11, true)
    dispatch('webBluetoothDFUObjectValidate', payload)
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
  } else if (payload.opCode === Write.Actions.CREATE && payload.responseCode === Write.Responses.SUCCESS) {
    console.log('    CREATE SUCCESS')
    payload.transferObject.state = TransferObjectState.Transfering
    // start the transfer of the object
    payload.offset = 0
    dispatch('webBluetoothDFUObjectToPackets', payload)
    dispatch('webBluetoothDFUObjectSetPacketReturnNotification', payload.transferObject)
    dispatch('webBluetoothDFUObjectTransferDataPackages', payload.transferObject)
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
  } else if (payload.opCode === Write.Actions.SET_PRN && payload.responseCode === Write.Responses.SUCCESS) {
    //
    console.log('    PRN SUCCESS')
  } else {
    console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode)
  }
}
*/

/*
async webBluetoothDFUObjectHandleEventWhileTransfering ({ dispatch, commit }, payload) {
  console.log('webBluetoothDFUObjectHandleEventWhileTransfering');
  if (payload.opCode === Write.Actions.CALCULATE_CHECKSUM && payload.responseCode === Write.Responses.SUCCESS) {
    // verify how much how the transfer that has been completed
    payload.offset = payload.dataView.getUint32(7, true)
    payload.checksum = payload.dataView.getUint32(11, true)
    dispatch('webBluetoothDFUObjectValidate', payload)
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
  } else if (payload.opCode === Write.Actions.SET_PRN && payload.responseCode === Write.Responses.SUCCESS) {
    //NOP
  } else {
    console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode)
  }
}
*/

/*
async webBluetoothDFUObjectHandleEventWhileStoring ({ dispatch, commit }, payload) {
  console.log('webBluetoothDFUObjectHandleEventWhileStoring');
  if (payload.opCode === Write.Actions.EXECUTE && payload.responseCode === Write.Responses.SUCCESS) {
    payload.transferObject.state = TransferObjectState.Completed
    commit(MutationTypes.UPDATE_TRANSFER_OBJECT, payload.transferObject)
  } else if (payload.opCode === Write.Actions.SET_PRN && payload.responseCode === Write.Responses.SUCCESS) {
    //NOP
  } else {
    console.log('  Operation: ' + payload.opCode + ' Result: ' + payload.responseCode)
  }
}
*/

export default TransferObjectActions
