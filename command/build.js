'use strict';

const path = require('path');
const Command = require('common-bin-plus');
const { createApp } = require('vuepress');
const vuepressConfig = require('../config');
const buildJsdoc = require('../lib/jsdoc');

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
      jsdoc: {
        type: 'boolean',
        description: 'enable jsdoc',
      },
    });
  }

  async run({ cwd, argv }) {
    const { src, dest, jsdoc } = argv;
    const sourceDir = src || path.join(cwd, 'docs');
    const targetDir = dest || path.join(cwd, 'dest');

    const options = Object.assign(vuepressConfig, {
      sourceDir,
      dest: targetDir,
    });

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
    return app.build();
  }

  get description() {
    return 'site builder';
  }
}

module.exports = BuildCommand;
