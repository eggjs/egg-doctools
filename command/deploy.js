'use strict';

const Command = require('../lib/base');
const publish = require('../lib/publish');
const runscript = require('runscript');

// The branch that pushing document
const BRANCH = 'gh-pages';
const DOC_PUBLISHER_NAME = 'Auto Doc Publisher';
const DOC_PUBLISHER_EMAIL = 'docs@eggjs.org';

class DeployCommand extends Command {
  async run(ctx) {
    await super.run(ctx);

    const options = this.getConfig(ctx.argv);
    await this.render('prod', options);
    await this.deployGithub(ctx.argv);
  }

  async deployGithub({ baseDir, destDir, githubToken }) {
    this.logger.info('deploy document');

    const token = process.env.GITHUB_TOKEN;

    let commmitMsg = await runscript('git log --format=%B -n 1', {
      stdio: 'pipe',
      cwd: baseDir,
    });
    commmitMsg = commmitMsg.stdout.toString().replace(/\n*$/, '');
    commmitMsg = 'docs: auto generate by ci \n' + commmitMsg;

    let repo = await runscript('git config remote.origin.url', {
      stdio: 'pipe',
      cwd: baseDir,
    });
    repo = repo.stdout.toString().slice(0, -1);
    if (/^http/.test(repo)) {
      repo = repo.replace('https://github.com/', 'git@github.com:');
    }

    if (githubToken && token) {
      // https://' + process.env.GH_TOKEN + '@github.com/user/private-repo.git',
      repo = repo.replace('git@github.com:', 'github.com/');
      repo = `https://${token}@${repo}`;
    }

    this.logger.info('publish %s from %s to gh-pages', repo, destDir);
    await publish(destDir, {
      logger(message) {
        console.log(message);
      },
      user: {
        name: DOC_PUBLISHER_NAME,
        email: DOC_PUBLISHER_EMAIL,
      },
      branch: BRANCH,
      repo,
      message: commmitMsg,
    });
  }

  get description() {
    return 'Deploy document';
  }
}

module.exports = DeployCommand;
