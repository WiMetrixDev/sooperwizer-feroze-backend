'use strict';

const controllers = require('../../controllers/floorOperations/user.controller.js');

const users = function controller(fastify, options, done) {
  fastify.post('/signin', controllers.signin);
  fastify.post('/signup', controllers.signup);
  fastify.get('/users/findAll', controllers.findAllUsers);
  fastify.put('/resetPassword', controllers.resetPassword);
  done();
};

module.exports = users;
