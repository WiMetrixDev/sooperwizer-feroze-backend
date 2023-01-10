'use strict';

const controllers = require('../../controllers/spts/allocatedMachine.controller.js');

const allocatedMachines = function controller(fastify, options, done) {
  fastify.get('/allocatedmachines/findOne/:BoxID', controllers.get);
  fastify.get('/allocatedmachines/findAll', controllers.getAll);
  fastify.post('/allocatedmachines/insertOne', controllers.add);
  fastify.post('/allocatedmachines/insertMany', controllers.addMany);
  fastify.put('/allocatedmachines/updateOne/:BoxID', controllers.update);
  fastify.delete('/allocatedmachines/deleteOne/:BoxID', controllers.delete);
  done();
};

module.exports = allocatedMachines;
