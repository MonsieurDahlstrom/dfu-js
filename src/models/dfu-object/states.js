/** Different states a TransferObject can be in **/
const DFUObjectStates = {
  NotStarted: 0x01,
  Creating: 0x02,
  Transfering: 0x03,
  Storing: 0x04,
  Completed: 0x05,
  Failed: 0x06
}

export default DFUObjectStates
