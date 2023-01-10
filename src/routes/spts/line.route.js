'use strict';

const controllers = require('../../controllers/spts/line.controller.js');

const lines = function controller(fastify, options, done) {
  fastify.get('/lines/findOne/:LineID', controllers.get);
  fastify.get('/lines/findAll', controllers.getAll);
  fastify.post('/lines/insertOne', controllers.add);
  fastify.post('/lines/insertMany', controllers.addMany);
  fastify.put('/lines/updateOne/:LineID', controllers.update);
  fastify.delete('/lines/deleteOne/:LineID', controllers.deleteOne);
  done();
};

module.exports = lines;
