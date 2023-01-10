'use strict';

const controllers = require('../../controllers/spts/color.controller.js');

const sizes = function controller(fastify, options, done) {
  fastify.get('/colors/findOne/:ColorID', controllers.get);
  fastify.get('/colors/findAll', controllers.getAll);
  fastify.post('/colors/insertOne', controllers.add);
  fastify.post('/colors/insertMany', controllers.addMany);
  fastify.put('/colors/updateOne/:ColorID', controllers.update);
  fastify.delete('/colors/deleteOne/:ColorID', controllers.deleteOne);
  done();
};

module.exports = sizes;
