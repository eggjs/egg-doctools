'use strict';

const path = require('path');
const Command = require('common-bin');
const { createApp } = require('vuepress');
const vuepressConfig = require('../config');

class DevCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.yargs.options({
      src: {
        type: 'string',
        description: 'source dir',
      },
      config: {
        type: 'string',
        description: 'config file',
      },
    });
  }

  async run({ cwd, argv }) {
    const { src } = argv;
    const sourceDir = src || path.join(cwd, 'docs');
    const options = Object.assign(vuepressConfig, { sourceDir });
    const app = createApp(options);
    await app.process();
    return app.dev();
  }

  get description() {
    return 'dev server';
  }
}

module.exports = DevCommand;
