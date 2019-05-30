"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
The states a DFU StateMachine can have:
  - NOT_CONFIGURED, bluetooth characteristics have not been set
  - IDLE, state machine is ready for use
  - TRANSFERING, state machine is i the process of updating a device
  - COMPLETE, indicates that a device update has been completed
  - FAILED, device update failed
**/
var StateMachineStates = {
  NOT_CONFIGURED: 0x00,
  IDLE: 0x01,
  TRANSFERING: 0x02,
  COMPLETE: 0x03,
  FAILED: 0x04
};

exports.default = StateMachineStates;