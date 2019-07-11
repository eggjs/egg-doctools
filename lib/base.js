'use strict';

const cpy = require('cpy');
const path = require('path');
const chokidar = require('chokidar');
const runscript = require('runscript');
const config = require('../config');
const jsdoc = require('../lib/jsdoc');
const Command = require('common-bin-plus');
const { fs } = require('mz');
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
      theme: {
        type: 'string',
        default: '@vuepress/theme-default',
        description: 'document theme',
      },
      configPath: {
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

  getConfig({ theme, configPath, baseDir, targetDir, destDir }) {
    let userConf = {};
    if (configPath) {
      userConf = require(`${path.join(baseDir, configPath)}`);
    }

    const cliConf = { theme, sourceDir: targetDir, dest: destDir };

    return Object.assign(config, cliConf, userConf, {
      clearScreen: false,
    });
  }

  async copyDir(sourceDir, targetDir) {
    this.logger.info('Copy files from %s to %s', sourceDir, targetDir);
    await cpy('**/*', targetDir, {
      cwd: sourceDir,
      nodir: true,
      parents: true,
    });
  }

  watch({ docPath, baseDir, targetDir }) {
    chokidar
      .watch(docPath, { ignored: /(^|[\/\\])\../, ignoreInitial: true })
      .on('all', async (event, filepath) => {
        const sourcePath = path.join(baseDir, filepath);
        const targetPath = filepath.replace(docPath, targetDir);

        if ([ 'add', 'change' ].includes(event)) {
          await fs.copyFile(sourcePath, targetPath);
        }

        if ([ 'addDir' ].includes(event)) {
          await mkdirp(targetPath);
        }

        if ([ 'unlink', 'unlinkDir' ].includes(event)) {
          await rimraf(targetPath);
        }
      });
  }

  async jsdoc({ baseDir, targetDir, enableJsdoc }) {
    if (!enableJsdoc) {
      this.logger.info('Build API Documents: Skip');
      return;
    }

    this.logger.info('Build API Documents');
    await jsdoc(baseDir, path.join(targetDir, '.vuepress/public/api'));
  }

  async prepare({ docPath, targetDir, external }) {
    // $baseDir/docs/* > $targetDir/*
    await this.copyDir(docPath, targetDir);

    // download external framework
    const externalPath = path.join(targetDir, 'external');
    const dirs = await this.downloadExternal(external, externalPath);
    for (const dir of dirs) {
      await this.copyDir(path.join(externalPath, dir, docPath), targetDir);
    }
  }

  async render(env, options) {
    const app = createApp(options);
    await app.process();

    if (env === 'dev') {
      return app.dev();
    }

    return app.build();
  }
}

module.exports = BaseCommand;
