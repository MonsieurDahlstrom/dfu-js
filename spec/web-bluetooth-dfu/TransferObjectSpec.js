import {TransferObject,TransferObjectState} from '../../src/dfu/TransferObject'

describe("TransferObject", function() {

  describe("#constructor", function() {
    it('throws error without data', function() {
        expect( () => {
          new TransferObject()
        }).toThrow();
    })
    it("with data", function() {
      expect( () => {
        let dataset = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
        let transferObject = new TransferObject(dataset)
        expect(transferObject.chunks.length).toBe(2)
      }).not.toThrow();
    })
  })

  describe("#begin", function() {
    let dataset;
    let transferObject;
    let transfer;
    beforeEach(function() {
      dataset = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transferObject = new TransferObject(dataset,0,0,transfer)
    })
    it('sets state', function() {
      expect( () => transferObject.begin()).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Creating)
    })
    it('initiate first task', function() {
      expect( () => transferObject.begin()).not.toThrow()
      expect(transfer.addTask).toHaveBeenCalled()
    })
  })

  describe("#verify", function() {
    let dataset;
    let transferObject;
    let transfer;
    let dataView;
    beforeEach(function() {
      dataset = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transferObject = new TransferObject(dataset,0,0,transfer)
      dataView = new DataView(new ArrayBuffer(15))
    })
    it('parses offset', function() {
      dataView.setInt32(7,1456,true)
      let objectMock = spyOn(transferObject,'validate')
      expect(() => transferObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalledWith(1456,0)
    })
    it('parses crc', function() {
      dataView.setInt32(11,1456,true)
      let objectMock = spyOn(transferObject,'validate')
      expect(() => transferObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalledWith(0,1456)
    })
    it('adds task', function() {
      let objectMock = spyOn(transferObject,'validate')
      expect(() => transferObject.verify(dataView)).not.toThrow()
      expect(transfer.addTask).toHaveBeenCalled()
    })
    it('calls validate', function() {
      let objectMock = spyOn(transferObject,'validate')
      expect(() => transferObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalled()
    })
  })

  describe("#validate", function() {
    let dataset;
    let transfer;
    let transferObject;
    let transferMock;
    beforeEach(function() {
      dataset = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transferObject = new TransferObject(dataset,10,0,transfer)
      //dataView = new DataView(new ArrayBuffer(15))
      transferMock = spyOn(transferObject,'transfer')
    })
    it('with correct crc and content size', function() {
      //the object has previously been transfered completly
      expect( () => transferObject.validate(35,transferObject.crc)).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Storing)
      expect(transfer.addTask).toHaveBeenCalled()
    })
    it('with correct crc and smaller offset then content size', function() {
      //the object has previously been partially transferred
      expect( () => transferObject.validate(20,transferObject.crc)).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Transfering)
      expect(transfer.addTask).not.toHaveBeenCalled()
      expect(transferMock).toHaveBeenCalled()
    })
    it('with larger offset then content', function() {
      expect( () => transferObject.validate(39,transferObject.crc)).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Creating)
      expect(transfer.addTask).toHaveBeenCalled()
      expect(transferMock).not.toHaveBeenCalled()
    })
    it('with 0 as offset', function() {
      expect( () => transferObject.validate(0,transferObject.crc)).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Creating)
      expect(transfer.addTask).toHaveBeenCalled()
      expect(transferMock).not.toHaveBeenCalled()
    })
    it('with invalid crc', function() {
      expect( () => transferObject.validate(10,0)).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Creating)
      expect(transfer.addTask).toHaveBeenCalled()
      expect(transferMock).not.toHaveBeenCalled()
    })
  })

  describe("#transfer", function() {

  })

  describe("#setPacketReturnNotification", function() {

  })

  describe("#eventHandler", function() {

  })

})
