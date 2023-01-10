'use strict';

const controllers = require('../../controllers/spts/section.controller.js');

const sections = function controller(fastify, options, done) {
  fastify.get('/sections/findOne/:SectionID', controllers.get);
  fastify.get('/sections/findAll', controllers.getAll);
  fastify.post('/sections/assignSections', controllers.assignSections);
  fastify.post('/sections/insertOne', controllers.add);
  fastify.get('/sections/getAssignedSections/:SectionID', controllers.getAssignedSections);
  fastify.post('/sections/insertMany', controllers.addMany);
  fastify.put('/sections/updateOne/:SectionID', controllers.update);
  fastify.delete('/sections/deleteOne/:SectionID', controllers.deleteOne);
  done();
};

module.exports = sections;
