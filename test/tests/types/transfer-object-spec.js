import {expect} from 'chai'
import factory from '../../factories'
import sinon from 'sinon'
import {TransferObject, TransferObjectState} from '../../../src/types/transfer-object'
import {Transfer} from '../../../src/types/Transfer'
import TransmissionStatus from '../../../src/types/transmission-types'

// import {Task, TaskType, TaskResult} from '../../src/dfu/Task'
//
import crc from 'crc'

describe("TransferObject", function() {

  let transferObject
  let sandbox
  beforeEach(function (done) {
    sandbox = sinon.sandbox.create()
    factory.build('transferObject')
    .then((newTransferObject) => {
      transferObject = newTransferObject
      done()
    })
  });
  afterEach(function () {
    sandbox.restore()
  });

  describe("#constructor", function() {
    describe('no parameters', function() {
      it('throws without dataset', function() {
          expect( ()=> new TransferObject()).to.not.throw();
      })
    })
    describe('parameters', function() {
      let transfer
      beforeEach(function (done) {
        factory.build('transfer')
        .then((newTransfer) => {
          transfer = newTransfer
          done()
        })
      })
      it('no errors', function() {
        expect( () => new TransferObject(0,20,transfer,0, function () {} )).to.not.throw();
      })
      it('has offset', function() {
        let transferObject = new TransferObject(0,20,transfer,0, function () {})
        expect(transferObject.transferOffset).to.equal(0)
      })
      it('has a length', function() {
        let transferObject =new TransferObject(0,20,transfer,0, function () {} )
        expect(transferObject.length).to.equal(20)
      })
      it('belongs to a Transfer', function(){
        let transferObject = new TransferObject(0,20,transfer,0, function () {} )
        expect(transferObject.transfer).to.equal(transfer)
      })
      it('has completition callback', function() {
        let onCompletitionFunc = function () {}
        let transferObject = new TransferObject(0,20,transfer,0, onCompletitionFunc )
        expect(transferObject.onCompletition).to.equal(onCompletitionFunc)
      })
    })
  })

  /*





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
  */
})
