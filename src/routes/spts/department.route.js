'use strict';

const controllers = require('../../controllers/spts/department.controller.js');

const departments = function controller(fastify, options, done) {
  fastify.get('/departments/findOne/:DepartmentID', controllers.get);
  fastify.get('/departments/findAll', controllers.getAll);
  fastify.post('/departments/insertOne', controllers.add);
  fastify.post('/departments/insertMany', controllers.addMany);
  fastify.put('/departments/updateOne/:DepartmentID', controllers.update);
  fastify.delete('/departments/deleteOne/:DepartmentID', controllers.delete);
  done();
};

module.exports = departments;
