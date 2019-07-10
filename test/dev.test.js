'use strict';

const path = require('path');
const coffee = require('coffee');
const request = require('supertest');
const { sleep, rimraf } = require('mz-modules');

const bin = require.resolve('../bin/doctools.js');
const cwd = path.join(__dirname, 'fixtures/test-files');

describe('test/dev.test.js', () => {
  describe('doctools dev --help', () => {
    it('doctools dev --help', done => {
      coffee
        .fork(bin, ['dev', '--help'], { cwd })
        // .debug()
        .expect('stdout', /Options:/)
        .expect('code', 0)
        .end(done);
    });
  });

  describe('doctools dev --enableJsdoc=true', () => {
    const url = 'http://localhost:8080';
    const target = path.join(cwd, 'run');

    let proc;

    before(async () => {
      const c = coffee.fork(bin, ['dev', '--enableJsdoc=true'], { cwd });
      // c.debug();
      c.coverage(false);
      c.expect('code', 0 || null);
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
