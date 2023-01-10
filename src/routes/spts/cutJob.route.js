'use strict';

const controllers = require('../../controllers/spts/cutJob.controller');

const cutjobs = function controller(fastify, options, done) {
  fastify.get(
    '/cutjobs/findByProductionOrderID/:ProductionOrderID',
    controllers.findByProductionOrderID,
  );
  fastify.get(
    '/cutjobs/findByProductionOrderIDAndSizeAndColor/:ProductionOrderID/:Size/:Color',
    controllers.findByProductionOrderIDAndSizeAndColor,
  );
  fastify.get('/cutjobs/findAll', controllers.getAll);
  fastify.post('/cutjobs/insertOne', controllers.addOne);
  fastify.post('/cutjobs/insertMany', controllers.addAll);
  fastify.put('/cutjobs/updateOne/:CutJobID', controllers.update);
  fastify.delete('/cutjobs/deleteOne/:CutJobID', controllers.delete);
  done();
};

module.exports = cutjobs;
