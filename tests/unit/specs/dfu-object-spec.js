import {expect} from 'chai'
import sinon from 'sinon'
//
import factory from '../factories'
//
import {DFUObject, DFUObjectStates} from '../../../src/models/dfu-object'
import {Task, TaskTypes, TaskResults} from '../../../src/models/task'
import {Transfer} from '../../../src/models/transfer'
import crc from 'crc'

describe("DFUObject", function() {

  before(function () {
    this.sandbox = sinon.createSandbox()
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
      beforeEach(function() {
        transfer.file = Array.from({length: 25}, () => Math.floor(Math.random() * 9));
        transferType = (Math.random() <= 0.5) === true ? 1 : 2;
      })
      it('no errors', function() {
        expect( ()=> new DFUObject(offset,length,transfer,transferType)).to.not.throw();
      })
      it('has offset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType)
        expect(dfuObject.offset).to.equal(offset)
      })
      it('has a length', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType)
        expect(dfuObject.length).to.equal(length)
      })
      it('belongs to a Transfer', function(){
        let dfuObject = new DFUObject(offset,length,transfer,transferType)
        expect(dfuObject.transfer).to.equal(transfer)
      })
      it('has chuncked dataset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType)
        dfuObject.toPackets(0)
        expect(dfuObject.chunks).to.be.an('array')
      })
      it('chunks equal dataset', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType)
        dfuObject.toPackets(0)
        let calculation = []
        for(var chunk of dfuObject.chunks) {
          calculation = calculation.concat(chunk)
        }
        expect(calculation).to.deep.equal(transfer.file.slice(offset,length))
      })
      it('chunks and dataset share CRC32', function() {
        let dfuObject = new DFUObject(offset,length,transfer,transferType)
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
    beforeEach(function(done) {
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.dfuObject.toPackets(0)
        done()
      })
    })
    afterEach(function () {
      this.dfuObject = undefined
    })
    it('when not started', function () {
      expect(this.dfuObject.progress.completed).to.equal(0.0)
    })
    it('start of transfer', function () {
      let dfuTask = Task.writePackage(new DataView(new ArrayBuffer(20)).buffer, this.dfuObject.transfer.packetPoint)
      this.dfuObject.onTaskComplete(null, dfuTask)
      expect(this.dfuObject.progress.completed).to.equal(20)
    })
    it('in middle of transfering', function () {
      var halfChunkIndex = this.dfuObject.chunks.length/2
      for(var index=0; index < halfChunkIndex ; index++) {
        let dfuTask = Task.writePackage(new DataView(new ArrayBuffer(20)).buffer, this.dfuObject.transfer.packetPoint)
        this.dfuObject.onTaskComplete(null, dfuTask)
      }
      expect(this.dfuObject.progress.completed/this.dfuObject.progress.size).to.equal(0.625)
    })
    it('end of transfer', function () {
      for (var chunk of this.dfuObject.chunks) {
        let dfuTask = Task.writePackage(new DataView(new ArrayBuffer(chunk.length)).buffer, this.dfuObject.transfer.packetPoint)
        this.dfuObject.onTaskComplete(null, dfuTask)
      }
      expect(this.dfuObject.progress.completed/this.dfuObject.progress.size).to.equal(1.0)
    })
  })

  describe("#addTask", function() {
    beforeEach(function(done) {
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.dfuObject.toPackets(0)
        done()
      })
      .catch( err => done(err))
    })
    it("with null task", function() { expect(() => this.dfuObject.addTask(null) ).to.throw("task is not of type Task") })
    it("task addded to queue", function() {
      this.dfuObject.taskQueue.pause()
      let task = new Task()
      expect(() => this.dfuObject.addTask(task) ).to.not.throw();
      expect(this.dfuObject.taskQueue.length()).to.equal(1)
    })

    it("task is executed", function(done) {
      factory.build('webBluetoothCharacteristic')
      .then(characteristic => {
        this.dfuObject.taskQueue.pause()
        this.dfuObject.taskQueue.drain( () => done() )
        this.dfuObject.addTask( Task.setPacketReturnNotification(1,characteristic) );
        this.dfuObject.taskQueue.resume()
      })
      .catch(err => done(err))
    })
  })

  describe("#begin", function() {
    beforeEach(function(done) {
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.dfuObject.toPackets(0)
        this.addTaskMock = this.sandbox.spy(this.dfuObject,'addTask')
        this.dfuObject.begin()
        done()
      })
      .catch(err => done(err))
    })
    afterEach(function () {
      this.dfuObject = undefined
      this.addTaskMock = undefined
    })
    it('sets state', function() { expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating) })
    it('initiate first task', function() { expect(this.addTaskMock.callCount).to.equal(1) })
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
    beforeEach(function (done) {
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.addTaskMock = this.sandbox.spy(this.dfuObject,'addTask')
        done()
      })
      .catch(err => done(err))
    })
    describe('with valid crc', function() {
      beforeEach(function() {
        this.sendChuncksSpy = this.sandbox.spy(this.dfuObject,'sendChuncks')
        this.dfuObjectCRC = crc.crc32(this.dfuObject.transfer.file.slice(0,this.dfuObject.length))
        this.dfuObject.taskQueue.pause()
      })
      it('offset larger then content', function() {
        this.dfuObject.validate(this.dfuObject.length+1,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
      it('offset is zero', function() {
        this.dfuObject.validate(0,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
      it('offset set to content length', function() {
        this.dfuObject.validate(this.dfuObject.length,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Storing)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
      it('offset > 0 && offset < content length', function() {
        this.dfuObjectCRC = crc.crc32(this.dfuObject.transfer.file.slice(0,1))
        this.dfuObject.validate(1,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Transfering)
        expect(this.addTaskMock.callCount).to.equal(8)
        expect(this.sendChuncksSpy.callCount).to.equal(1)
      })
    })

    describe('invalid src', function() {
      beforeEach(function() {
        this.sendChuncksSpy = this.sandbox.spy(this.dfuObject,'sendChuncks')
        this.dfuObjectCRC = crc.crc32(this.dfuObject.transfer.file)
        this.dfuObject.taskQueue.pause()
      })
      it('offset larger then content', function() {
        this.dfuObject.validate(35,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
      it('offset is zero', function() {
        this.dfuObject.validate(0,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
      it('offset set to content length', function() {
        this.dfuObject.validate(20,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
      it('offset > 0 && offset < content length', function() {
        this.dfuObject.validate(1,this.dfuObjectCRC)
        expect(this.dfuObject.state).to.equal(DFUObjectStates.Creating)
        expect(this.addTaskMock.callCount).to.equal(1)
        expect(this.sendChuncksSpy.callCount).to.equal(0)
      })
    })
  })

  describe("#sendChuncks", function() {
    beforeEach(function (done) {
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.dfuObject.toPackets(0)
        this.addTaskMock = this.sandbox.spy(this.dfuObject,'addTask')
        this.dfuObject.taskQueue.pause()
        done()
      })
      .catch(err => done(err))
    })
    it('slots a task for each data chunck in the transfer', function() {
      expect( () => this.dfuObject.sendChuncks()).to.not.throw()
      //maximum ble transmission size is 20. 25 fits in two chunks.
      expect(this.addTaskMock.callCount).to.equal(this.dfuObject.chunks.length)
    })
  })

  describe("#setPacketReturnNotification", function() {
    beforeEach(function (done) {
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.dfuObject.toPackets(0)
        done()
      })
      .catch(err => done(err))
    })
    it('completes', function() { expect( () => this.dfuObject.setPacketReturnNotification()).to.not.throw() })
    it('returns task', function() { expect( this.dfuObject.setPacketReturnNotification() instanceof Task).to.be.true })
  })

  describe("#eventHandler", function() {
    beforeEach(function (done) {
      this.dataView = new DataView(new ArrayBuffer(15))
      factory.create('dfuObject')
      .then(dfuObject => {
        this.dfuObject = dfuObject
        this.dfuObject.toPackets(0)
        this.dfuObject.taskQueue.pause()
        done()
      })
      .catch(err => done(err))
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
