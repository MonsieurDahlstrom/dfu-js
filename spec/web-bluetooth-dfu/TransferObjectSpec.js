import {TransferObject,TransferObjectState} from '../../src/dfu/TransferObject'

describe("TransferObject", function() {

  describe("#constructor", function() {

    it('error without data', function() {
        expect( () => {
          new TransferObject()
        }).toThrow();
    })
    
  })
})
