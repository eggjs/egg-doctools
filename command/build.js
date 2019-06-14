'use strict';

const path = require('path');
const Command = require('common-bin');
const { createApp } = require('vuepress');
const vuepressConfig = require('../config');

class BuildCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.yargs.options({
      src: {
        type: 'string',
        description: 'source dir',
      },
      dest: {
        type: 'string',
        description: 'target dir',
      },

      config: {
        type: 'string',
        description: 'config file',
      },
    });
  }

  async run({ cwd, argv }) {
    const { src, dest } = argv;
    const sourceDir = src || path.join(cwd, 'docs');
    const targetDir = dest || path.join(cwd, 'dest');

    const options = Object.assign(vuepressConfig, {
      sourceDir,
      dest: targetDir,
    });

    const app = createApp(options);
    await app.process();
    return app.build();
  }

  get description() {
    return 'site builder';
  }
}

module.exports = BuildCommand;
