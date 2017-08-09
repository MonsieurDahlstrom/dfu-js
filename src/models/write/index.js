import {Write,Verify,Create,PacketReturnNotification,Package,Checksum,Execute} from './write.js'
import WriteResponses from './write-responses'
import WriteTypes from './write-types'

const WriteModule = {
  Write: Write,
  Verify: Verify,
  Create: Create,
  PacketReturnNotification: PacketReturnNotification,
  Package: Package,
  Checksum: Checksum,
  Execute: Execute,
  Actions: WriteTypes,
  Responses: WriteResponses
}

export default WriteModule
