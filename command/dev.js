'use strict';

const Command = require('../lib/base');
const config = require('../config');

class DevCommand extends Command {
  async run(ctx) {
    await super.run(ctx);

    const { targetDir } = ctx.argv;
    const options = Object.assign(config, { sourceDir: targetDir });
    return this.render(options, 'dev');
  }

  get description() {
    return 'Run document server';
  }
}

module.exports = DevCommand;
