'use strict';

const Command = require('../lib/base');

class DevCommand extends Command {
  async run(ctx) {
    await super.run(ctx);

    // watch
    this.watch(ctx.argv);

    // run dev server
    const options = this.getConfig(ctx.argv);
    return this.render('dev', options, ctx.argv);
  }

  get description() {
    return 'Run document server';
  }
}

module.exports = DevCommand;
