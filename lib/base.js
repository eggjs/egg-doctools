'use strict';

const cpy = require('cpy');
const path = require('path');
const runscript = require('runscript');
const jsdoc = require('../lib/jsdoc');
const Command = require('common-bin-plus');
const { createApp } = require('vuepress');
const { rimraf, mkdirp } = require('mz-modules');

class BaseCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.options = {
      docPath: {
        type: 'string',
        default: 'docs',
        description: 'source dir',
      },
      dest: {
        type: 'string',
        default: 'dest',
        description: 'target dir',
      },
      config: {
        type: 'string',
        description: 'config file',
      },
      enableJsdoc: {
        type: 'boolean',
        default: false,
        description: 'build jsdoc',
      },
      external: {
        type: 'array',
        describe: 'external framework git repository',
      },
    };
  }

  async run({ cwd, argv }) {
    const baseDir = argv._[0] || cwd;
    argv.baseDir = path.resolve(baseDir);
    argv.destDir = path.join(argv.baseDir, 'run/doctools/dest');
    argv.targetDir = path.join(argv.baseDir, 'run/doctools');

    // If we've already had this folder, remove it
    // 1. There're some files useless and they will be left if we don't remove the folder
    // 2. Sometimes when we remove some folders in the 'run/doctools' and we directly run
    // 'npm run test', the original files won't be removed this will make us make mistakes
    // and we won't remove the related links, this will cause the submit error and the local
    // test cannot be checked out.
    const removePath = path.join(argv.baseDir, 'run');
    try {
      await rimraf(removePath);
      this.logger.info(
        `'${removePath}' is successfully removed, preparing to re-generate folders and files`
      );
    } catch (e) {
      this.logger.warn(`'${removePath}' failed to be removed,
        if you have useless files already generated before, please remove the folder manually.
        Detailed info: `);
      this.logger.warn(`${e.stack}`);
    }

    await this.prepare(argv);
    await this.jsdoc(argv);
  }

  async copy(docPath, targetDir) {
    this.logger.info('Copy files from %s', docPath);
    await cpy('**/*', targetDir, { cwd: docPath, nodir: true, parents: true });
  }

  async downloadExternal(external, externalPath) {
    if (!external || !external.length) return [];

    await rimraf(externalPath);
    await mkdirp(externalPath);

    const opt = { pipe: 'ignore' };
    const names = [];
    for (const repo of external) {
      this.logger.info('clone %s', repo);
      const name = String(Date.now());
      await runscript(
        `git clone --depth 1 ${repo} ${externalPath}/${name}`,
        opt
      );
      names.push(name);
    }
    return names;
  }

  async jsdoc({ baseDir, targetDir, enableJsdoc }) {
    if (!enableJsdoc) {
      this.logger.info('Build API Documents: Skip');
      return;
    }

    this.logger.info('Build API Documents');
    await jsdoc(baseDir, path.join(targetDir, '.vuepress/public/api'));
  }

  async render(options, env) {
    const app = createApp(options);
    await app.process();
    return env === 'dev' ? app.dev() : app.build();
  }

  async prepare({ docPath, targetDir, external }) {
    // $baseDir/docs/* > $targetDir/*
    await this.copy(docPath, targetDir);

    // download external framework
    const externalPath = path.join(targetDir, 'external');
    const dirs = await this.downloadExternal(external, externalPath);
    for (const dir of dirs) {
      await this.copy(path.join(externalPath, dir, docPath), targetDir);
    }
  }
}

module.exports = BaseCommand;