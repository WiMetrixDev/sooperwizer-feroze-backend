'use strict';

const controllers = require('../../controllers/spts/marker.controller');

const markers = function controller(fastify, options, done) {
  fastify.get('/markers/findOne/:MarkerID', controllers.get);
  fastify.get('/markers/findUniqueSizes', controllers.findUniqueSizes);
  fastify.get('/markers/findUniqueInseams', controllers.findUniqueInseams);
  fastify.get('/markers/findByProductionOrderID/:ProductionOrderID', controllers.findByProductionOrderID);
  fastify.get('/markers/findMarkerMappingByMarkerID/:MarkerID', controllers.findMarkerMappingByMarkerID);
  fastify.get('/markers/findBySaleOrderID/:SaleOrderID', controllers.findBySaleOrderID);
  fastify.get('/markers/findAll', controllers.getAll);
  fastify.post('/markers/insertOne', controllers.add);
  fastify.put('/markers/updateOne/:MarkerID', controllers.update);
  fastify.delete('/markers/deleteOne/:MarkerID', controllers.delete);
  done();
};

module.exports = markers;
