'use strict';

const controllers = require('../../controllers/spts/operation.controller.js');

const markers = function controller(fastify, options, done) {
  fastify.get('/operations/findOne/:OperationID', controllers.get);
  fastify.get('/operations/findAll', controllers.getAll);
  fastify.post('/operations/insertOne', controllers.add);
  fastify.post('/operations/insertMany', controllers.addMany);
  fastify.put('/operations/updateOne/:OperationID', controllers.update);
  fastify.delete('/operations/deleteOne/:OperationID', controllers.deleteOne);
  done();
};

module.exports = markers;
