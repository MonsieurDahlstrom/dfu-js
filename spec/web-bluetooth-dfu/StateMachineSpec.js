import {States,StateMachine} from '../../src/state-machine'
import {Firmware,FirmwareType} from '../../src/firmware'
import fs from 'fs'
import JSZip from 'jszip'

function testAsync(runAsync) {
  return (done) => {
    runAsync().then(done, e => { fail(e); done(); });
  };
}

describe('StateMachine', function() {
  let stateMachine;

  afterEach(function() {
    stateMachine = null;
  })

  it("should be without characteristics", function() {
    stateMachine = new StateMachine();
    expect(stateMachine).toBeTruthy();
    expect(stateMachine.state).toBe(States.NOT_CONFIGURED);
  })

  it("should be created with characteristics", function() {
    let controlPoint = {};
    let packetPoint = {};
    stateMachine = new StateMachine(controlPoint,packetPoint);
    expect(stateMachine).toBeTruthy();
    expect(stateMachine.state).toBe(States.IDLE);
  })

  describe('#sendFirmware', function() {

    let firmware;
    beforeAll(testAsync(async function() {
      let content = fs.readFileSync('spec/data/dfu_test_app_hrm_s130.zip')
      let zip = await JSZip.loadAsync(content)
      firmware = new Firmware(zip);
    }))

    it('should fail when not configured', function() {
      stateMachine = new StateMachine();
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).toThrowError("StateMachine is not configured with bluetooth characteristics");
    })

    it('should fail when not idle', function() {
      stateMachine = new StateMachine();
      stateMachine.state = States.TRANSFERING
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).toThrowError("Can only initate transfer when idle")
    })

    it('should fail when firmware is null', function() {
      stateMachine = new StateMachine();
      stateMachine.state = States.IDLE
      expect( function() {
        stateMachine.sendFirmware(null);
      }).toThrowError("Firmware needs to be of class Firmware");
    })

    it('should succeed when idle and firmware is valid', function() {
      stateMachine = new StateMachine();
      stateMachine.state = States.IDLE
      expect( function() {
        stateMachine.sendFirmware(firmware);
      }).toBeTruthy();
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

  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrowError("song is already playing");
    });
  });
});
*/
