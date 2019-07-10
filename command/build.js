'use strict';

const Command = require('../lib/base');

class BuildCommand extends Command {
  async run(ctx) {
    await super.run(ctx);

    const options = this.getConfig(ctx.argv);
    return this.render('prod', options);
  }

  get description() {
    return 'Build document';
  }
}

module.exports = BuildCommand;
