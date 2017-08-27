import {expect} from 'chai'
import sinon from 'sinon'

//
import {DFUObject, DFUObjectStates} from '../../src/models/dfu-object'
import {Task, TaskTypes, TaskResults} from '../../src/models/task'
import {Transfer} from '../../src/models/transfer'
import crc from 'crc'

describe("DFUObject", function() {

  before(function () {
    this.sandbox = sinon.sandbox.create()
  })
  afterEach(function () {
    this.sandbox.restore()
  })

  describe("#constructor", function() {
    describe('no parameters', function() {
      it('throws without dataset', function() {
          expect( ()=> new DFUObject()).to.not.throw();
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
        expect( ()=> new DFUObject(offset,length,transfer,transferType,onCompletition)).to.not.throw();
      })
      it('has offset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.offset).to.equal(offset)
      })
      it('has a length', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.length).to.equal(length)
      })
      it('belongs to a Transfer', function(){
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.transfer).to.equal(transfer)
      })
      it('has completition callback', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        expect(dfuObject.onCompletition).to.equal(onCompletition)
      })
      it('has chuncked dataset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        dfuObject.toPackets(0)
        expect(dfuObject.chunks).to.be.an('array')
      })
      it('chunks equal dataset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        dfuObject.toPackets(0)
        let calculation = []
        for(var chunk of dfuObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(calculation).to.deep.equal(transfer.file.slice(offset,length))
      })
      it('chunks and dataset share CRC32', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType,onCompletition)
        dfuObject.toPackets(0)
        let calculation = []
        for(var chunk of dfuObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(crc.crc32(calculation)).to.equal(crc.crc32(transfer.file.slice(offset,length)))
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
      expect(dfuObject.progress()).to.equal(0.0)
    })
    it('0.01 when creating', function () {
      dfuObject.state = DFUObjectStates.Creating
      expect(dfuObject.progress()).to.equal(0.01)
    })
    it('0.99 when storing', function () {
      dfuObject.state = DFUObjectStates.Storing
      expect(dfuObject.progress()).to.equal(0.99)
    })
    it('1.0 when completed', function () {
      dfuObject.state = DFUObjectStates.Completed
      expect(dfuObject.progress()).to.equal(1.0)
    })
    it('1.0 when failed', function () {
      dfuObject.state = DFUObjectStates.Failed
      expect(dfuObject.progress()).to.equal(1.0)
    })
    it('in middle of transfering', function () {
      dfuObject.state = DFUObjectStates.Transfering
      dfuObject.transfer = {tasks: {length: 2}}
      dfuObject.chunks = [5,2,3,4,5,7,8,9,10,10]
      expect(dfuObject.progress()).to.equal(0.78)
    })
    it('start of transfer', function () {
      dfuObject.state = DFUObjectStates.Transfering
      dfuObject.transfer = {tasks: {length: 10}}
      dfuObject.chunks = [5,2,3,4,5,7,8,9,10,10]
      expect(dfuObject.progress()).to.equal(0.02)
    })
    it('end of transfer', function () {
      dfuObject.state = DFUObjectStates.Transfering
      dfuObject.transfer = {tasks: {length: 0}}
      dfuObject.chunks = [5,2,3,4,5,7,8,9,10,10]
      expect(dfuObject.progress()).to.equal(0.98)
    })
  })

  describe("#begin", function() {
    let dfuObject
    let transferMock
    beforeEach(function() {
      dfuObject = new DFUObject()
      let transfer = new Transfer()
      transferMock = this.sandbox.stub(transfer)
      dfuObject.transfer = transferMock
      dfuObject.begin()
    })
    it('sets state', function() {
      expect(dfuObject.state).to.equal(DFUObjectStates.Creating)
    })
    it('initiate first task', function() {
      expect(transferMock.addTask.callCount).to.equal(1)
    })
  })

  describe("#verify", function() {
    beforeEach(function() {
      this.dataView = new DataView(new ArrayBuffer(15))
      this.dfuObject = new DFUObject()
      this.transferMock = this.sandbox.stub(this.dfuObject,'validate')
    })
    it('parses offset', function() {
      this.dataView.setInt32(7,1456,true)
      expect(() => this.dfuObject.verify(this.dataView)).to.not.throw()
      expect(this.transferMock.callCount).to.equal(1)
      expect(this.transferMock.firstCall.args).to.deep.equal([1456,0])
    })
    it('parses crc', function() {
      this.dataView.setInt32(11,1456,true)
      expect(() => this.dfuObject.verify(this.dataView)).to.not.throw()
      expect(this.transferMock.callCount).to.equal(1)
      expect(this.transferMock.firstCall.args).to.deep.equal([0,1456])
    })
    it('calls validate', function() {
      expect(() => this.dfuObject.verify(this.dataView)).to.not.throw()
    })
  })

  describe("#validate", function() {

    describe('with valid crc', function() {
      beforeEach(function() {
        this.transfer = new Transfer()
        this.transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        this.transferMock = this.sandbox.stub(this.transfer)
        this.dfuObject = new DFUObject(0,20,this.transfer,1, function() {})
        this.dfuObjectTransferSpy = this.sandbox.spy(this.dfuObject,'sendChuncks')
      })
      it('offset larger then content', function() {
        let dfuObjectCRC = crc.crc32(this.transfer.file.slice(0,20))
        this.dfuObject.validate(35,dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.transferMock.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
      it('offset is zero', function() {
        let dfuObjectCRC = crc.crc32(this.transfer.file.slice(0,20))
        this.dfuObject.validate(0,dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.transfer.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
      it('offset set to content length', function() {
        let dfuObjectCRC = crc.crc32(this.transfer.file.slice(0,20))
        this.dfuObject.validate(20,dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Storing)
        expect(this.transfer.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
      it('offset > 0 && offset < content length', function() {
        let dfuObjectCRC = crc.crc32(this.transfer.file.slice(0,1))
        this.dfuObject.validate(1,dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Transfering)
        expect(this.transfer.addTask.callCount).to.equal(2)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(1)
      })
    })

    describe('invalid src', function() {
      beforeEach(function() {
        this.transfer = new Transfer()
        this.transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
        this.transferMock = this.sandbox.stub(this.transfer)
        this.dfuObject = new DFUObject(0,20,this.transfer,1, function() {})
        this.dfuObjectCRC = crc.crc32(this.transfer.file.slice(0,85))
        this.dfuObjectTransferSpy = this.sandbox.spy(this.dfuObject,'sendChuncks')
      })
      it('offset larger then content', function() {
        this.dfuObject.validate(35,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.transfer.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
      it('offset is zero', function() {
        this.dfuObject.validate(0,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.transfer.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
      it('offset set to content length', function() {
        this.dfuObject.validate(20,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.transfer.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
      it('offset > 0 && offset < content length', function() {
        this.dfuObject.validate(1,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.transfer.addTask.callCount).to.equal(1)
        expect(this.dfuObjectTransferSpy.callCount).to.equal(0)
      })
    })
  })

  describe("#sendChuncks", function() {
    beforeEach(function() {
      this.transfer = new Transfer()
      this.transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      this.transferMock = this.sandbox.stub(this.transfer)
      this.dfuObject = new DFUObject(0,20,this.transfer,1, function() {})
      this.dfuObject.toPackets()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => this.dfuObject.sendChuncks(0)).to.not.throw()
      //maximum ble transmission size is 20. 25 fits in two chunks.
      expect(this.transferMock.addTask.callCount).to.equal(this.dfuObject.chunks.length)
    })
  })

  describe("#setPacketReturnNotification", function() {
    let transfer
    let dfuObject
    beforeEach(function() {
      this.transfer = new Transfer()
      this.transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      this.transferMock = this.sandbox.stub(this.transfer)
      this.dfuObject = new DFUObject(0,20,this.transfer,1, function() {})
      this.dfuObject.toPackets()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => this.dfuObject.setPacketReturnNotification()).to.not.throw()
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( this.dfuObject.setPacketReturnNotification() instanceof Task).to.be.true
    })
  })

  describe("#eventHandler", function() {
    beforeEach(function() {
      this.dataView = new DataView(new ArrayBuffer(15))
      this.transfer = new Transfer()
      this.transfer.file = Array.from({length: 144}, () => Math.floor(Math.random() * 9));
      this.transferMock = this.sandbox.stub(this.transfer)
      this.dfuObject = new DFUObject(0,20,this.transfer,1, function() {})
      this.dfuObject.toPackets()
    })
    describe('when in Creating state', function() {
      beforeEach(function(){
        this.dfuObject.state = DFUObjectStates.Creating
      })
      it('handles TaskTypes.SELECT repsonse', function() {
        let onSelectSpy = this.sandbox.spy(this.dfuObject,'onSelect')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.SELECT)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onSelectSpy.calledOnce).to.be.true
      })
      it('handles TaskTypes.CREATE repsonse', function() {
        let onCreateSpy = this.sandbox.spy(this.dfuObject,'onCreate')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.CREATE)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onCreateSpy.calledOnce).to.be.true
      })
      it('handles TaskTypes.SET_PRN repsonse', function() {
        let onPacketNotificationSpy = this.sandbox.spy(this.dfuObject,'onPacketNotification')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.SET_PRN)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onPacketNotificationSpy.calledOnce).to.be.true
      })
    })
    describe('when in Transfering state', function() {
      beforeEach(function(){
        this.dfuObject.state = DFUObjectStates.Transfering
      })
      it('handles TaskTypes.CALCULATE_CHECKSUM repsonse', function() {
        let onChecksumSpy = this.sandbox.spy(this.dfuObject,'onChecksum')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.CALCULATE_CHECKSUM)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onChecksumSpy.calledOnce).to.be.true
      })
      it('handles TaskTypes.SET_PRN repsonse', function() {
        let onPacketNotificationSpy = this.sandbox.spy(this.dfuObject,'onPacketNotification')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.SET_PRN)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onPacketNotificationSpy.calledOnce).to.be.true
      })
    })
    describe('when in Storing state', function() {
      beforeEach(function(){
        this.dfuObject.state = DFUObjectStates.Storing
      })
      it('handles TaskTypes.EXECUTE repsonse', function() {
        let onExecuteSpy = this.sandbox.spy(this.dfuObject,'onExecute')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.EXECUTE)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onExecuteSpy.calledOnce).to.be.true
      })
      it('handles TaskTypes.SET_PRN repsonse', function() {
        let onPacketNotificationSpy = this.sandbox.spy(this.dfuObject,'onPacketNotification')
        this.dataView.setUint8(0,TaskTypes.RESPONSE_CODE)
        this.dataView.setUint8(1,TaskTypes.SET_PRN)
        this.dataView.setUint8(2,TaskResults.SUCCESS)
        expect( () => this.dfuObject.eventHandler(this.dataView)).to.not.throw()
        expect(onPacketNotificationSpy.calledOnce).to.be.true
      })
    })
  })
})
