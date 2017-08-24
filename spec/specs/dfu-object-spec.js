import {DFUObject, DFUObjectStates} from '../../src/models/dfu-object'
import {Task, TaskTypes, TaskResults} from '../../src/models/task'
import {Transfer} from '../../src/models/transfer'
import crc from 'crc'

describe("DFUObject", function() {

  describe("#constructor", function() {
    describe('no parameters', function() {
      it('throws without dataset', function() {
          expect( ()=> new DFUObject()).not.toThrow();
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
        expect( ()=> new DFUObject(offset,length,transfer,transferType,onCompletition)).not.toThrow();
      })
      it('has offset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.parentOffset).toBe(offset)
      })
      it('has a length', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.objectLength).toBe(length)
      })
      it('belongs to a Transfer', function(){
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.parentTransfer).toBe(transfer)
      })
      it('has completition callback', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.onCompletition).toBe(onCompletition)
      })
      it('has chuncked dataset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        dfuObject.toPackets(0)
        expect(dfuObject.chunks).toEqual(jasmine.any(Array))
      })
      it('chunks equal dataset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        dfuObject.toPackets(0)
        let calculation = []
        for(var chunk of dfuObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(calculation).toEqual(transfer.file.slice(offset,length))
      })
      it('chunks and dataset share CRC32', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        dfuObject.toPackets(0)
        let calculation = []
        for(var chunk of dfuObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(crc.crc32(calculation)).toEqual(crc.crc32(transfer.file.slice(offset,length)))
      })
    })
  })

  describe("#progress", function () {
    let dfuObject
    beforeEach(function() {
      dfuObject = new DFUObject()
    })
    it('0.0 when not started', function () {
      dfuObject.state = DFUObjectStates.NotStarted
      expect(dfuObject.progress()).toBe(0.0)
    })
    it('0.01 when creating', function () {
      dfuObject.state = DFUObjectStates.Creating
      expect(dfuObject.progress()).toBe(0.01)
    })
    it('0.99 when storing', function () {
      dfuObject.state = DFUObjectStates.Storing
      expect(dfuObject.progress()).toBe(0.99)
    })
    it('1.0 when completed', function () {
      dfuObject.state = DFUObjectStates.Completed
      expect(dfuObject.progress()).toBe(1.0)
    })
    it('1.0 when failed', function () {
      dfuObject.state = DFUObjectStates.Failed
      expect(dfuObject.progress()).toBe(1.0)
    })
    it('in middle of transfering', function () {
      dfuObject.state = DFUObjectStates.Transfering
      dfuObject.parentTransfer = {bleTasks: {length: 2}}
      dfuObject.chunks = [5,2,3,4,5,7,8,9,10,10]
      expect(dfuObject.progress()).toBe(0.78)
    })
    it('start of transfer', function () {
      dfuObject.state = DFUObjectStates.Transfering
      dfuObject.parentTransfer = {bleTasks: {length: 10}}
      dfuObject.chunks = [5,2,3,4,5,7,8,9,10,10]
      expect(dfuObject.progress()).toBe(0.02)
    })
    it('end of transfer', function () {
      dfuObject.state = DFUObjectStates.Transfering
      dfuObject.parentTransfer = {bleTasks: {length: 0}}
      dfuObject.chunks = [5,2,3,4,5,7,8,9,10,10]
      expect(dfuObject.progress()).toBe(0.98)
    })
  })

  describe("#begin", function() {
    let dfuObject
    let transferMock
    beforeEach(function() {
      dfuObject = new DFUObject()
      transferMock = jasmine.createSpyObj('Transfer',['addTask'])
      dfuObject.parentTransfer = transferMock
    })
    it('sets state', function() {
      dfuObject.begin()
      expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
    })
    it('initiate first task', function() {
      dfuObject.begin()
      expect(transferMock.addTask).toHaveBeenCalled()
    })
  })

  describe("#verify", function() {
    let dataView;
    let dfuObject
    beforeEach(function() {
      dfuObject = new DFUObject()
      dataView = new DataView(new ArrayBuffer(15))
    })
    it('parses offset', function() {
      dataView.setInt32(7,1456,true)
      let objectMock = spyOn(dfuObject,'validate')
      expect(() => dfuObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalledWith(1456,0)
    })
    it('parses crc', function() {
      dataView.setInt32(11,1456,true)
      let objectMock = spyOn(dfuObject,'validate')
      expect(() => dfuObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalledWith(0,1456)
    })
    it('calls validate', function() {
      let objectMock = spyOn(dfuObject,'validate')
      expect(() => dfuObject.verify(dataView)).not.toThrow()
      expect(objectMock).toHaveBeenCalled()
    })
  })

  describe("#validate", function() {

    describe('with valid crc', function() {
      let transfer
      let dfuObject
      let dfuObjectCRC
      let dfuObjectTransferSpy
      beforeEach(function() {
        transfer = jasmine.createSpyObj('Transfer',['addTask'])
        transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        dfuObject = new DFUObject(0,20,transfer,1, function() {})
        dfuObjectTransferSpy = spyOn(dfuObject,'transfer')
      })
      it('offset larger then content', function() {
        dfuObjectCRC = crc.crc32(transfer.file.slice(0,20))
        dfuObject.validate(35,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset is zero', function() {
        dfuObjectCRC = crc.crc32(transfer.file.slice(0,20))
        dfuObject.validate(0,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset set to content length', function() {
        dfuObjectCRC = crc.crc32(transfer.file.slice(0,20))
        dfuObject.validate(20,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Storing)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset > 0 && offset < content length', function() {
        dfuObjectCRC = crc.crc32(transfer.file.slice(0,1))
        dfuObject.validate(1,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Transfering)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).toHaveBeenCalled()
      })
    })

    describe('invalid src', function() {
      let transfer
      let dfuObject
      let dfuObjectCRC
      let dfuObjectTransferSpy
      beforeEach(function() {
        transfer = jasmine.createSpyObj('Transfer',['addTask'])
        transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        dfuObject = new DFUObject(0,20,transfer,1, function() {})
        dfuObjectCRC = crc.crc32(transfer.file.slice(0,85))
        dfuObjectTransferSpy = spyOn(dfuObject,'transfer')
      })
      it('offset larger then content', function() {
        dfuObject.validate(35,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset is zero', function() {
        dfuObject.validate(0,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset set to content length', function() {
        dfuObject.validate(20,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
      it('offset > 0 && offset < content length', function() {
        dfuObject.validate(1,dfuObjectCRC)
        expect(dfuObject.state).toEqual(DFUObjectStates.Creating)
        expect(transfer.addTask).toHaveBeenCalled()
        expect(dfuObjectTransferSpy).not.toHaveBeenCalled()
      })
    })
  })

  describe("#transfer", function() {
    let transfer
    let dfuObject
    beforeEach(function() {
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      dfuObject = new DFUObject(0,20,transfer,1, function() {})
      dfuObject.toPackets()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => dfuObject.transfer(0)).not.toThrow()
      //maximum ble transmission size is 20. 25 fits in two chunks.
      expect(transfer.addTask.calls.count()).toEqual(dfuObject.chunks.length)
    })
  })

  describe("#setPacketReturnNotification", function() {
    let transfer
    let dfuObject
    beforeEach(function() {
      transfer = jasmine.createSpyObj('Transfer',['addTask'])
      transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      dfuObject = new DFUObject(0,20,transfer,1, function() {})
      dfuObject.toPackets()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => dfuObject.setPacketReturnNotification()).not.toThrow()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( dfuObject.setPacketReturnNotification()).toEqual(jasmine.any(Task))
    })
  })

  describe("#eventHandler", function() {
    let dataView;
    let dfuObject
    beforeEach(function() {
      dataView = new DataView(new ArrayBuffer(15))
      dfuObject = new DFUObject()
    })
    describe('when in Creating state', function() {
      beforeEach(function(){
        dfuObject.state = DFUObjectStates.Creating
      })
      it('handles TaskTypes.SELECT repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onSelect')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.SELECT)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskTypes.CREATE repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onCreate')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.CREATE)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskTypes.SET_PRN repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onPacketNotification')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.SET_PRN)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
    })
    describe('when in Transfering state', function() {
      beforeEach(function(){
        dfuObject.state = DFUObjectStates.Transfering
      })
      it('handles TaskTypes.CALCULATE_CHECKSUM repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onChecksum')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.CALCULATE_CHECKSUM)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskTypes.SET_PRN repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onPacketNotification')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.SET_PRN)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
    })
    describe('when in Storing state', function() {
      beforeEach(function(){
        dfuObject.state = DFUObjectStates.Storing
      })
      it('handles TaskTypes.EXECUTE repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onExecute')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.EXECUTE)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
      it('handles TaskTypes.SET_PRN repsonse', function() {
        let onSelectSpy = spyOn(dfuObject,'onPacketNotification')
        dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        dataView.setUint8(1,TaskTypes.SET_PRN)
        dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => dfuObject.eventHandler(dataView)).not.toThrow()
        expect(onSelectSpy).toHaveBeenCalled()
      })
    })
  })
})
