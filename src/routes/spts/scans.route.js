'use strict';

const controllers = require('../../controllers/spts/scans.controller');

const scanss = function controller(fastify, options, done) {
  fastify.get(
    '/scans/findByProductionOrderID/:ProductionOrderID',
    controllers.findScansByProductionOrderID,
  );

  done();
};

module.exports = scanss;
