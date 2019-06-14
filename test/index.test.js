'use strict';

const path = require('path');
const coffee = require('coffee');
const pkg = require('../package.json');

const bin = require.resolve('../bin/egg-doctools.js');
const cwd = path.join(__dirname, 'fixtures/test-files');

describe('test/index.test.js', () => {
  it('egg-doctools --help', done => {
    coffee
      .fork(bin, [ '--help' ], { cwd })
      // .debug()
      .expect('stdout', /Usage: egg-doctools <command> \[options]/)
      .expect('code', 0)
      .end(done);
  });

  it('egg-doctools --version', done => {
    coffee
      .fork(bin, [ '--version' ], { cwd })
      // .debug()
      .expect('stdout', `${pkg.version}\n`)
      .expect('code', 0)
      .end(done);
  });
});
