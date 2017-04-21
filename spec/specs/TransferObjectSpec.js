import {TransferObject,TransferObjectState} from '../../src/dfu/TransferObject'
import {Task, TaskType, TaskResult} from '../../src/dfu/Task'
import {Transfer} from '../../src/dfu/Transfer'
import crc from 'crc'

describe("TransferObject", function() {

  describe("#constructor", function() {
    describe('no parameters', function() {
      it('throws without dataset', function() {
          expect( ()=> new TransferObject()).not.toThrow();
      })
    })
    describe('with parameters', function() {
      //offset, length, transfer, transferType, onCompletitionCallback
      let offset = 0
      let length = 20
      let transfer = new Transfer()
      let transferType
      let onCompletition = function() {}
      beforeEach(function() {
        transfer.file = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
        transferType = (Math.random() <= 0.5) === true ? 1 : 2;
      })
      it('no errors', function() {
        expect( ()=> new TransferObject(offset,length,transfer,transferType,onCompletition)).not.toThrow();
      })
      it('has offset', function() {
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        expect(transferObject.parentOffset).toBe(offset)
      })
      it('has a length', function() {
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        expect(transferObject.objectLength).toBe(length)
      })
      it('belongs to a Transfer', function(){
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        expect(transferObject.parentTransfer).toBe(transfer)
      })
      it('has completition callback', function() {
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        expect(transferObject.onCompletition).toBe(onCompletition)
      })
      it('has chuncked dataset', function() {
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        transferObject.toPackets(0)
        expect(transferObject.chunks).toEqual(jasmine.any(Array))
      })
      it('chunks equal dataset', function() {
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        transferObject.toPackets(0)
        let calculation = []
        for(var chunk of transferObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(calculation).toEqual(transfer.file.slice(offset,length))
      })
      it('chunks and dataset share CRC32', function() {
        let transferObject = new TransferObject(offset,length,transfer,transferType,onCompletition)
        transferObject.toPackets(0)
        let calculation = []
        for(var chunk of transferObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(crc.crc32(calculation)).toEqual(crc.crc32(transfer.file.slice(offset,length)))
      })
    })
  })

describe("#begin", function() {
  let transferObject
  let transferMock
  beforeEach(function() {
    transferObject = new TransferObject()
    transferMock = jasmine.createSpyObj('Transfer',['addTask'])
    transferObject.parentTransfer = transferMock
  })
  it('sets state', function() {
    transferObject.begin()
    expect(transferObject.state).toEqual(TransferObjectState.Creating)
  })
  it('initiate first task', function() {
    transferObject.begin()
    expect(transferMock.addTask).toHaveBeenCalled()
  })
  })

  describe("#verify", function() {
    let dataView;
    let transferObject
    beforeEach(function() {
      transferObject = new TransferObject()
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
    it('calls validate', function() {
      let objectMock = spyOn(transferObject,'validate')
      expect(() => transferObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalled()
    })
  })

  describe("#validate", function() {

    describe('with valid crc', function() {
      let transfer
      let transferObject
      let transferObjectCRC
      let transferObjectTransferSpy
      beforeEach(function() {
        transfer = jasmine.createSpyObj('Transfer',['addTask'])
        transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        transferObject = new TransferObject(0,20,transfer,1, function() {})
        transferObjectTransferSpy = spyOn(transferObject,'transfer')
      })
      it('offset larger then content', function() {
        transferObjectCRC = crc.crc32(transfer.file.slice(0,20))
        transferObject.validate(35,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset is zero', function() {
        transferObjectCRC = crc.crc32(transfer.file.slice(0,20))
        transferObject.validate(0,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset set to content length', function() {
        transferObjectCRC = crc.crc32(transfer.file.slice(0,20))
        transferObject.validate(20,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Storing)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset > 0 && offset < content length', function() {
        transferObjectCRC = crc.crc32(transfer.file.slice(0,1))
        transferObject.validate(1,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Transfering)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).toHaveBeenCalled()
      })
    })

    describe('invalid src', function() {
      let transfer
      let transferObject
      let transferObjectCRC
      let transferObjectTransferSpy
      beforeEach(function() {
        transfer = jasmine.createSpyObj('Transfer',['addTask'])
        transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        transferObject = new TransferObject(0,20,transfer,1, function() {})
        transferObjectCRC = crc.crc32(transfer.file.slice(0,85))
        transferObjectTransferSpy = spyOn(transferObject,'transfer')
      })
      it('offset larger then content', function() {
        transferObject.validate(35,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset is zero', function() {
        transferObject.validate(0,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset set to content length', function() {
        transferObject.validate(20,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset > 0 && offset < content length', function() {
        transferObject.validate(1,transferObjectCRC)
        expect(transferObject.state).toEqual(TransferObjectState.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(transferObjectTransferSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe("#transfer", function() {
    let transfer
    let transferObject
    beforeEach(function() {
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      transferObject = new TransferObject(0,20,transfer,1, function() {})
      transferObject.toPackets()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => transferObject.transfer(0)).not.toThrow()
      //maximum ble transmission size is 20. 25 fits in two chunks.
      expect(transfer.addTask.calls.count()).toEqual(transferObject.chunks.length)
    })
  })

  describe("#setPacketReturnNotification", function() {
    let transfer
    let transferObject
    beforeEach(function() {
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      transferObject = new TransferObject(0,20,transfer,1, function() {})
      transferObject.toPackets()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => transferObject.setPacketReturnNotification()).not.toThrow()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( transferObject.setPacketReturnNotification()).toEqual(jasmine.any(Task))
    })
  })

  describe("#eventHandler", function() {
    let dataView;
    let transferObject
    beforeEach(function() {
      dataView = new DataView(new ArrayBuffer(15))
      transferObject = new TransferObject()
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
