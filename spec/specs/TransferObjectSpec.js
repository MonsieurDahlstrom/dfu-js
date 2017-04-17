import {TransferObject,TransferObjectState} from '../../src/dfu/TransferObject'
import {Task, TaskType, TaskResult} from '../../src/dfu/Task'

describe("TransferObject", function() {

  let dataset;
  let transferObject;
  let transfer;
  beforeEach(function() {
    dataset = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
    transfer = jasmine.createSpyObj('Transfer',['addTask'])
    transferObject = new TransferObject(dataset,10,0,transfer)
  })
  afterEach(function() {
    dataset = null
    transfer = null
    transferObject = null
  })

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
    let dataView;
    beforeEach(function() {
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
    let transferMock;
    beforeEach(function() {
      transferMock = spyOn(transferObject,'transfer')
    })
    it('with correct crc and content size', function() {
      //the object has previously been transfered completly
      expect( () => transferObject.validate(35,transferObject.crc)).not.toThrow()
      expect(transferObject.state).toEqual(TransferObjectState.Storing)
      expect(transfer.addTask).toHaveBeenCalled()
      expect(transferMock).not.toHaveBeenCalled()
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
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => transferObject.transfer(0)).not.toThrow()
      //maximum ble transmission size is 20. 25 fits in two chunks.
      expect(transfer.addTask.calls.count()).toBe(2)
    })
  })

  describe("#setPacketReturnNotification", function() {
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => transferObject.setPacketReturnNotification()).not.toThrow()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( transferObject.setPacketReturnNotification()).toEqual(jasmine.any(Task))
    })
  })

  describe("#eventHandler", function() {
    let dataView;
    beforeEach(function() {
      dataView = new DataView(new ArrayBuffer(15))
    })
    describe('when in Creating state', function() {
      beforeEach(function(){
        transferObject.state = TransferObjectState.Creating
      })
      it('handles TaskType.SELECT repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onSelect')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.SELECT)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskType.CREATE repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onCreate')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.CREATE)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskType.SET_PRN repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onPacketNotification')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.SET_PRN)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
    })
    describe('when in Transfering state', function() {
      beforeEach(function(){
        transferObject.state = TransferObjectState.Transfering
      })
      it('handles TaskType.CALCULATE_CHECKSUM repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onChecksum')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.CALCULATE_CHECKSUM)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskType.SET_PRN repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onPacketNotification')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.SET_PRN)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
    })
    describe('when in Storing state', function() {
      beforeEach(function(){
        transferObject.state = TransferObjectState.Storing
      })
      it('handles TaskType.EXECUTE repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onExecute')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.EXECUTE)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskType.SET_PRN repsonse', function() {
        let onSelectSpy = spyOn(transferObject,'onPacketNotification')
        dataView.setUint8(0,TaskType.RESPONSE_CODE)
        dataView.setUint8(1,TaskType.SET_PRN)
        dataView.setUint8(2,TaskResult.SUCCESS)
        expect( () => transferObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
    })
  })

})
