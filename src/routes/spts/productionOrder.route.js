'use strict';

const controllers = require('../../controllers/spts/productionOrder.controller');

const productionorders = function controller(fastify, options, done) {
  fastify.get('/productionorders/findOne/:ProductionOrderID', controllers.findProductionOrderByID);
  fastify.get('/productionorders/findBySaleOrderID/:SaleOrderID', controllers.findProductionOrdersForSaleOrderID);
  fastify.get('/productionorders/findByStyleTemplateID/:StyleTemplateID', controllers.findByStyleTemplateID);
  fastify.get('/productionorders/findAll', controllers.getAll);
  fastify.post('/productionorders/insertOne', controllers.addOne);
  fastify.post('/productionorders/insert', controllers.addAll);
  fastify.put('/productionorders/updateOne/:ProductionOrderID', controllers.update);
  fastify.delete('/productionorders/deleteOne/:ProductionOrderID', controllers.delete);
  fastify.post('/productionorders/closePO', controllers.closePO);
  done();
};

module.exports = productionorders;
