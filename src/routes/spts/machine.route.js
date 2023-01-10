'use strict';

const controllers = require('../../controllers/spts/machine.controller.js');

const machines = function controller(fastify, options, done) {
  fastify.get('/machines/findOne/:MachineID', controllers.get);
  fastify.get('/machines/findAll', controllers.getAll);
  fastify.post('/machines/insertOne', controllers.add);
  fastify.post('/machines/insertMany', controllers.addMany);
  fastify.put('/machines/updateOne/:MachineID', controllers.update);
  fastify.delete('/machines/deleteOne/:MachineID', controllers.deleteOne);
  fastify.post('/machines/assign/:MachineID', controllers.machineAssignment);
  fastify.get('/machines/findAllocatedWorkersByMachineID/:MachineID', controllers.getAllocatedWorkers);
  done();
};

module.exports = machines;
