'use strict';

const controllers = require('../../controllers/sqms/inline.controller');

const inline = function controller(fastify, options, done) {
  fastify.get(
    '/SQMS/inline/getOperationsForWorkerID/:WorkerID',
    controllers.getOperationsForWorkerID,
  );
  fastify.post(
    '/SQMS/inline/getDetailsForWorkerID',
    controllers.getDetailsForWorkerID,
  );
  fastify.get(
    '/SQMS/inline/getFaults/:SectionID',
    controllers.getFaults,
  );
  fastify.post('/SQMS/inline/registerFault', controllers.registerFault);
  fastify.post(
    '/SQMS/inline/checkRoundForMachine',
    controllers.checkRoundForMachine,
  );
  fastify.post(
    '/SQMS/inline/createAuditFormSession',
    controllers.createAuditFormSession,
  );
  fastify.get(
    '/SQMS/inline/getFaultsHistoryByMachineID/:MachineID',
    controllers.getFaultsAndCheckListHistory,
  );
  done();
};

module.exports = inline;
