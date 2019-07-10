'use strict';

const Command = require('../lib/base');
const config = require('../config');

class BuildCommand extends Command {
  async run(ctx) {
    await super.run(ctx);

    const { targetDir, destDir } = ctx.argv;
    const options = Object.assign(config, {
      sourceDir: targetDir,
      dest: destDir,
    });

    return this.render(options, 'prod');
  }

  get description() {
    return 'Build document';
  }
}

module.exports = BuildCommand;
