'use strict';

const ghpages = require('gh-pages');

module.exports = (basePath, options) => {
  return done => ghpages.publish(basePath, options, done);
};
