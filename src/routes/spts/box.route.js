'use strict';

const controllers = require('../../controllers/spts/box.controller.js');

const boxes = function controller(fastify, options, done) {
  fastify.get('/boxes/findOne/:BoxID', controllers.get);
  fastify.get('/boxes/findAll', controllers.getAll);
  fastify.post('/boxes/insertOne', controllers.add);
  fastify.post('/boxes/insertMany', controllers.addMany);
  fastify.put('/boxes/updateOne/:BoxID', controllers.update);
  fastify.delete('/boxes/deleteOne/:BoxID', controllers.delete);
  done();
};

module.exports = boxes;
