/**
Nordic defines two different type of file transfers:
    init package is known as Command object
    firmware is known as Data object
**/
const TransferObjectTypes = {
  Command: 0x01,
  Data: 0x02
}

export default TransferObjectTypes
