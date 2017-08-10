// DFU by Nordic Semiconductor
const DFU_BASE = '0000xxxx-0000-1000-8000-00805f9b34fb'
export const DFUSecure = DFU_BASE.replace('xxxx', 'fe59')
const DFU_CHAR_BASE = '8ec9xxxx-f315-4f60-9fb8-838830daea50'

export default class WebBluetoothGatteMock {

  constructor() {
    this.dfuService = undefined
  }

  async getPrimaryService (uuid) {
    if(uuid === DFUSecure) {
      return this.dfuService
    }
  }

}
