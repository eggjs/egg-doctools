'use strict';

const ghpages = require('gh-pages');

module.exports = (basePath, options) => {
  return new Promise((resolve, reject) => {
    ghpages.publish(basePath, options, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};
