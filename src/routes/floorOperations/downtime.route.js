'use strict';
const controllers = require('../../controllers/floorOperations/downtime.controller');

const downtime = function controller(fastify, options, done) {
  fastify.get(
    '/downtime/getMachineDownStatusForLineID/:LineID',
    controllers.getMachineDownStatusForLineID,
  );

  fastify.get(
    '/downtime/getDownReasons',
    controllers.getDownReasons,
  );

  fastify.post(
    '/downtime/getDownTimeReport',
    controllers.getDownTimeReport,
  );

  fastify.post(
    '/downtime/insertDownTime',
    controllers.insertDownTime,
  );

  fastify.post(
    '/downtime/endDownTime',
    controllers.endDownTime,
  );

  fastify.get(
    '/downtime/getDownTimeReport',
    controllers.getDownTimeReport,
  );

  done();
};

module.exports = downtime;
