"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
Nordic defines two different type of file transfers:
    init package is known as Command object
    firmware is known as Data object
**/
var TransferObjectTypes = {
  Command: 0x01,
  Data: 0x02
};

exports.default = TransferObjectTypes;