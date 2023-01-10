'use strict';

const controllers = require('../../controllers/spts/worker.controller.js');

const workers = function controller(fastify, options, done) {
  fastify.get('/workers/findOne/:WorkerID', controllers.get);
  fastify.get('/workers/findAll', controllers.getAll);
  fastify.get('/workers/findAllWorkersInfo', controllers.getAllWorkersInfo);
  fastify.post('/workers/insertOne', controllers.add);
  fastify.post('/workers/insertMany', controllers.addMany);
  fastify.post('/workers/assignMachines', controllers.assignMachines);
  fastify.put('/workers/updateOne/:WorkerID', controllers.update);
  fastify.delete('/workers/deleteOne/:WorkerID', controllers.deleteOne);
  done();
};

module.exports = workers;
