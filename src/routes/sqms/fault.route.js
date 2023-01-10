'use strict';

const controllers = require('../../controllers/sqms/fault.controller.js');

const faults = function controller(fastify, options, done) {
  fastify.get('/faults/findOne/:FaultID', controllers.get);
  fastify.get('/faults/findAll', controllers.getAll);
  fastify.post('/faults/insertOne', controllers.add);
  fastify.post('/faults/insertMany', controllers.addMany);
  fastify.put('/faults/updateOne/:FaultID', controllers.update);
  fastify.delete('/faults/deleteOne/:FaultID', controllers.delete);
  done();
};

module.exports = faults;
