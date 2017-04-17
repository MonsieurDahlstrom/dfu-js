import {States,StateMachine} from '../../src/state-machine'
import {Firmware,FirmwareType} from '../../src/firmware'
import fs from 'fs'
import JSZip from 'jszip'

describe('StateMachine', function() {
  let stateMachine;

  afterEach(function() {
    stateMachine = null;
  })

  describe("#constructor", function() {

    it("without characteristics", function() {
      stateMachine = new StateMachine();
      expect(stateMachine).toBeTruthy();
      expect(stateMachine.state).toBe(States.NOT_CONFIGURED);
    })

    it("with characteristics", function() {
      let controlPoint = {};
      let packetPoint = {};
      stateMachine = new StateMachine(controlPoint,packetPoint);
      expect(stateMachine).toBeTruthy();
      expect(stateMachine.state).toBe(States.IDLE);
    })

  })

  describe('#sendFirmware', function() {

    let firmware;
    let stateMachine;

    beforeAll(function(done) {
      let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
      return JSZip.loadAsync(content)
      .then(zip => {
        firmware = new Firmware(zip)
        return firmware.parseManifest()
      })
      .then(() => {
        done();
      })
    })

    beforeEach(function() {
      stateMachine = new StateMachine();
    })

    afterEach(function() {
      stateMachine = undefined;
    })


    it('fails when not configured', function() {
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).toThrowError("StateMachine is not configured with bluetooth characteristics");
    })

    it('fails when not idle', function() {
      stateMachine.state = States.TRANSFERING
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).toThrowError("Can only initate transfer when idle")
    })

    it('fails without firmware', function() {
      stateMachine.state = States.IDLE
      expect( function() {
        stateMachine.sendFirmware(null);
      }).toThrowError("Firmware needs to be of class Firmware");
    })

    it('succeed when idle and firmware is valid', function() {
      stateMachine.state = States.IDLE
      stateMachine.fileTransfers.pause()
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).not.toThrow();
    })

    it("addTransfers called", function() {
      stateMachine.state = States.IDLE
      stateMachine.fileTransfers.pause()
      let spyObject = spyOn(stateMachine, 'addTransfer');
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).not.toThrow();
      expect(spyObject.calls.count()).toBe(2);
    })
  })
})
/*
describe("Player", function() {
  var Player = require('../../lib/jasmine_examples/Player');
  var Song = require('../../lib/jasmine_examples/Song');
  var player;
  var song;

  beforeEach(function() {
    player = new Player();
    song = new Song();
  });

  it("should be able to play a Song", function() {
    player.play(song);
    expect(player.currentlyPlayingSong).toEqual(song);

    //demonstrates use of custom matcher
    expect(player).toBePlaying(song);
  });

  describe("when song has been paused", function() {
    beforeEach(function() {
      player.play(song);
      player.pause();
    });

    it("should indicate that the song is currently paused", function() {
      expect(player.isPlaying).toBeFalsy();

      // demonstrates use of 'not' with a custom matcher
      expect(player).not.toBePlaying(song);
    });

    it("should be possible to resume", function() {
      player.resume();
      expect(player.isPlaying).toBeTruthy();
      expect(player.currentlyPlayingSong).toEqual(song);
    });
  });

  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });
*/
