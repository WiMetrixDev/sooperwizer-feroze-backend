'use strict';

const controllers = require('../../controllers/spts/style.controller');

const stylebulletins = function controller(fastify, options, done) {
  fastify.get('/stylebulletins/findOne/:StyleBulletinID', controllers.get);
  fastify.get('/stylebulletins/findAll', controllers.getAll);
  fastify.get('/stylebulletins/findByStyleTemplateID/:StyleTemplateID', controllers.findByStyleTemplateID);
  fastify.post('/stylebulletins/insertOne', controllers.insertOneStyleBulletin);
  fastify.post('/stylebulletins/insertMany', controllers.insertManyStyleBulletins);
  fastify.put('/stylebulletins/updateOne/:StyleBulletinID', controllers.updateOneStyleBulletin);
  fastify.put('/stylebulletins/updateByStyleTemplateID/:StyleTemplateID', controllers.updateByStyleTemplateID);
  fastify.delete('/stylebulletins/deleteOne/:StyleBulletinID', controllers.deleteOneStyleBulletin);
  fastify.post('/stylebulletins/assignStyleBulletin', controllers.assignStyleBulletin);
  done();
};

module.exports = stylebulletins;
