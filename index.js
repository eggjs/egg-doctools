'use strict';

const Command = require('common-bin-plus');
const path = require('path');

class MainCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: egg-doctools <command> [options]';

    // command
    this.load(path.join(__dirname, 'command'));
  }
}

module.exports = MainCommand;
