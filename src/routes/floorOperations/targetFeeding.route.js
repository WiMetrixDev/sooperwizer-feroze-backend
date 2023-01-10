'use strict';
const controllers = require('../../controllers/floorOperations/targetFeeding.controller');

const targetfeeding = function controller(fastify, options, done) {
  fastify.get('/targetfeedings/findOne/:TargetFeedingID', controllers.get);
  fastify.get('/targetfeedings/findAll', controllers.getAll);
  fastify.post('/targetfeedings/insertOne', controllers.add);
  fastify.post('/targetfeedings/insertMany', controllers.addMany);
  fastify.get('/targetfeedings/getEfficiencyForLine/:id', controllers.getColorEfficiencyByLine);
  fastify.post('/targetfeedings/addEfficiencyForLine', controllers.addColorEfficiency);
  fastify.put('/targetfeedings/updateOne/:TargetFeedingID', controllers.update);
  fastify.delete('/targetfeedings/deleteOne/:TargetFeedingID', controllers.deleteOne);
  done();
};

module.exports = targetfeeding;
