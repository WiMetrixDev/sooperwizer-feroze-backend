'use strict';

const controllers = require('../../controllers/sqms/endline.controller');

const endline = function controller(fastify, options, done) {
  fastify.post(
    '/SQMS/endline/getBundlesForCutJobID',
    controllers.getBundlesForCutJobID,
  );
  fastify.post(
    '/SQMS/endline/getInfoForTagID',
    controllers.getInfoForTagID,
  );
  fastify.post(
    '/SQMS/endline/getFaultHistoryForPieceID/',
    controllers.getFaultHistoryForPieceID,
  );
  fastify.post(
    '/SQMS/endline/getPiecesForBundleID',
    controllers.getPiecesForBundleID,
  );
  fastify.post(
    '/SQMS/endline/getOperationAndWorkersDetailsByPieceID',
    controllers.getOperationAndWorkersDetailsByPieceID,
  );
  fastify.post(
    '/SQMS/endline/createEndlineSession',
    controllers.createEndlineSession,
  );
  //   fastify.post("/SQMS/endline/registerFault", endlineController.registerFault);
  //   fastify.post(
  //     "/SQMS/endline/checkRoundForMachine",
  //     endlineController.checkRoundForMachine
  //   );
  //   fastify.post(
  //     "/SQMS/endline/createAuditFormSession",
  //     endlineController.createAuditFormSession
  //   );
  //   fastify.get(
  //     "/SQMS/endline/getFaultsHistoryByMachineID/:MachineID",
  //     endlineController.getFaultsAndCheckListHistory
  //   );
  done();
};

module.exports = endline;
