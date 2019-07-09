'use strict';

const path = require('path');
const Command = require('common-bin-plus');
const { createApp } = require('vuepress');
const vuepressConfig = require('../config');
const buildJsdoc = require('../lib/jsdoc');

class DevCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.yargs.options({
      src: {
        type: 'string',
        description: 'source dir',
      },
      jsdoc: {
        type: 'boolean',
        description: 'enable jsdoc',
      },
      config: {
        type: 'string',
        description: 'config file',
      },
    });
  }

  async run({ cwd, argv }) {
    const { src, jsdoc } = argv;
    const sourceDir = src || path.join(cwd, 'docs');
    const options = Object.assign(vuepressConfig, { sourceDir });

    // JSDOC
    this.logger.info('Build API Documents');
    if (jsdoc) {
      await buildJsdoc({
        baseDir: cwd,
        target: path.join(sourceDir, '.vuepress/public/api'),
      });
    }

    // SITE
    this.logger.info('Build Documents');
    const app = createApp(options);
    await app.process();
    return app.dev();
  }

  get description() {
    return 'dev server';
  }
}

module.exports = DevCommand;
