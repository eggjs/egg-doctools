'use strict';

const Command = require('../lib/base');

class DevCommand extends Command {
  async run(ctx) {
    await super.run(ctx);

    const options = this.getConfig(ctx.argv);
    return this.render('dev', options);
  }

  get description() {
    return 'Run document server';
  }
}

module.exports = DevCommand;
