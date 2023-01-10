'use strict';

const controllers = require('../../controllers/sqms/versions.controller');

const versions = function controller(fastify, options, done) {
  fastify.get('/versions/get/:appType', controllers.getVersion);
  done();
};

module.exports = versions;
