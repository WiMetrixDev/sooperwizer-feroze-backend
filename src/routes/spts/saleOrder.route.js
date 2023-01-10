'use strict';

const controllers = require('../../controllers/spts/saleOrder.controller');

const saleorders = function controller(fastify, options, done) {
  fastify.get('/saleorders/findOne/:SaleOrderID', controllers.getOne);
  fastify.get('/saleorders/findAll', controllers.getAll);
  fastify.get('/saleorders/findDistinctCustomers', controllers.findDistinctCustomers);
  fastify.post('/saleorders/insertOne', controllers.add);
  fastify.post('/saleorders/insertMany', controllers.addMany);
  fastify.put('/saleorders/updateOne/:SaleOrderID', controllers.update);
  fastify.delete('/saleorders/deleteOne/:SaleOrderID', controllers.delete);
  done();
};

module.exports = saleorders;
