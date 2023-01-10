'use strict';

const controllers = require('../../controllers/floorOperations/cardManager.controller');

const cardManager = function controller(fastify, options, done) {
  fastify.get('/cardManager/getData/:cardType', controllers.getData);
  fastify.get(
    '/cardManager/getAllInfoForTagID/:tagID',
    controllers.getAllInfoForTagID,
  );
  fastify.get(
    '/cardManager/returnPieces/:TagID',
    controllers.returnPieces,
  );
  fastify.get(
    '/cardManager/getDataForCard/:cardType/:cardNumber',
    controllers.getDataForCard,
  );
  fastify.post(
    '/cardManager/getFilteredPieces',
    controllers.getPieces,
  );
  fastify.get(
    '/cardManager/getPiecesForBundleID/:BundleID',
    controllers.getPiecesForBundleID,
  );
  fastify.get(
    '/cardManager/returnPieceScanning/:TagID',
    controllers.returnPieceScanning,
  );
  fastify.post(
    '/cardManager/assignTagToBundle',
    controllers.assignTagToBundle,
  );
  fastify.post(
    '/cardManager/assignTagToGroup',
    controllers.assignTagToGroup,
  );
  fastify.get(
    '/cardManager/getScanningsForTagID/:TagID',
    controllers.getScanningDetailsForTagID,
  );
  fastify.post('/cardManager/insertPieces', controllers.insertPieces);
  done();
};

module.exports = cardManager;
