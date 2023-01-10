'use strict';

const controllers = require('../../controllers/spts/machineType.controller.js');

const machineTypes = function controller(fastify, options, done) {
  fastify.get('/machinetypes/findOne/:MachineTypeID', controllers.get);
  fastify.get('/machinetypes/findAll', controllers.getAll);
  fastify.post('/machinetypes/insertOne', controllers.add);
  fastify.post('/machinetypes/insertMany', controllers.addMany);
  fastify.put('/machinetypes/updateOne/:MachineTypeID', controllers.update);
  fastify.delete('/machinetypes/deleteOne/:MachineTypeID', controllers.deleteOne);
  done();
};

module.exports = machineTypes;
