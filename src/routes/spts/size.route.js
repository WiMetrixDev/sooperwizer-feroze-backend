'use strict';

const controllers = require('../../controllers/spts/size.controller.js');

const sizes = function controller(fastify, options, done) {
  fastify.get('/sizes/findOne/:SizeID', controllers.get);
  fastify.get('/sizes/findAll', controllers.getAll);
  fastify.post('/sizes/insertOne', controllers.add);
  fastify.post('/sizes/insertMany', controllers.addMany);
  fastify.put('/sizes/updateOne/:SizeID', controllers.update);
  fastify.delete('/sizes/deleteOne/:SizeID', controllers.deleteOne);
  done();
};

module.exports = sizes;
