'use strict';

const fs = require('mz/fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const { sleep, rimraf } = require('mz-modules');

const bin = require.resolve('../bin/egg-doctools.js');
const cwd = path.join(__dirname, 'fixtures/test-files');

describe('test/build.test.js', () => {
  describe('egg-doctools build --help', () => {
    it('egg-doctools build --help', done => {
      coffee
        .fork(bin, ['build', '--help'], { cwd })
        .expect('stdout', /Options:/)
        .expect('code', 0)
        .end(done);
    });
  });

  describe('egg-doctools build --jsdoc=true', () => {
    const apiPath = path.join(cwd, 'docs/.vuepress/public/api');
    const sitePath = path.join(cwd, 'dest');

    let proc;

    before(async () => {
      const c = coffee.fork(bin, ['build', '--jsdoc=true'], { cwd });
      // c.debug();
      c.coverage(false);
      c.expect('code', 0).end();

      // wait server listen
      await sleep(40000);
      proc = c.proc;
    });

    after(() => {
      proc.kill();
    });

    after(async () => {
      await rimraf(apiPath);
      await rimraf(sitePath);
    });

    it('should generate site index page', async () => {
      const docPath = path.join(sitePath, 'index.html');
      const content = await fs.readFile(docPath, 'utf8');
      assert(content.includes('test-files'));
    });

    it('should generate api index page', async () => {
      const docPath = path.join(sitePath, '/api/index.html');
      const content = await fs.readFile(docPath, 'utf8');
      assert(content.includes('Documentation generated'));
    });
  });
});
