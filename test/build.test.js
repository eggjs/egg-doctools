'use strict';

const fs = require('mz/fs');
const path = require('path');
const assert = require('assert');
const coffee = require('coffee');
const { sleep, rimraf } = require('mz-modules');

const bin = require.resolve('../bin/doctools.js');
const cwd = path.join(__dirname, 'fixtures/test-files');

describe('test/build.test.js', () => {
  describe('doctools build --help', () => {
    it('doctools build --help', done => {
      coffee
        .fork(bin, [ 'build', '--help' ], { cwd })
        .expect('stdout', /Options:/)
        .expect('code', 0)
        .end(done);
    });
  });

  describe('doctools build --enableJsdoc=true', () => {
    const target = path.join(cwd, 'run/doctools');

    let proc;

    before(async () => {
      const c = coffee.fork(bin, [ 'build', '--enableJsdoc=true' ], { cwd });
      // c.debug();
      c.coverage(false);
      c.expect('code', 0);
      c.end();

      // wait server listen
      await sleep(40000);
      proc = c.proc;
    });

    after(() => {
      proc.kill();
    });

    after(async () => {
      await rimraf(target);
    });

    it('should generate site index page', async () => {
      const docPath = path.join(target, 'dest/index.html');
      const content = await fs.readFile(docPath, 'utf8');
      assert(content.includes('test-files'));
    });

    it('should generate api index page', async () => {
      const docPath = path.join(target, 'dest/api/index.html');
      const content = await fs.readFile(docPath, 'utf8');
      assert(content.includes('Documentation generated'));
    });
  });
});
