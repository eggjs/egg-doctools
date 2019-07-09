'use strict';

const path = require('path');
const coffee = require('coffee');
const { sleep, rimraf } = require('mz-modules');
const request = require('supertest');

const bin = require.resolve('../bin/egg-doctools.js');
const cwd = path.join(__dirname, 'fixtures/test-files');

describe('test/server.test.js', () => {
  describe('egg-doctools dev --help', () => {
    it('egg-doctools dev --help', done => {
      coffee
        .fork(bin, [ 'dev', '--help' ], { cwd })
        .expect('stdout', /Options:/)
        .expect('code', 0)
        .end(done);
    });
  });

  describe('egg-doctools dev --jsdoc=true', () => {
    const url = 'http://localhost:8080';
    const apiPath = path.join(cwd, 'docs/.vuepress/public/api');
    let proc;

    before(async () => {
      const c = coffee.fork(bin, [ 'dev', '--jsdoc=true' ], { cwd });
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
    });

    it('request site index page', () => {
      return request(url)
        .get('/')
        .expect(200);
    });

    it('request api index page', () => {
      return request(url)
        .get('/api/index.html')
        .expect(200);
    });
  });
});
