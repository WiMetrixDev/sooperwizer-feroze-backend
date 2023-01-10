'use strict';

const controllers = require('../../controllers/spts/cutReport.controller');

const cutreports = function controller(fastify, options, done) {
  fastify.get('/cutreports/findOne/:CutReportID', controllers.get);
  fastify.get('/cutreports/findCutReportsByCutJobID/:CutJobID', controllers.findCutReportsForCutJobID);
  fastify.get('/cutreports/findAll', controllers.getAll);
  fastify.post('/cutreports/insertMany', controllers.addAll);
  fastify.post('/cutreports/insertOne', controllers.addOne);
  fastify.post('/cutreports/insertBundle', controllers.addNewBundle);
  fastify.put('/cutreports/updateOne/:BundleID', controllers.updateOneCutReport);
  fastify.delete('/cutreports/deleteOne/:BundleID', controllers.deleteOneCutReport);
  fastify.get('/cutreports/getBundlesByCutJobID/:CutJobID', controllers.getHistoryForCutJob);
  fastify.post('/cutreports/printBundle', controllers.printBundle);
  done();
};

module.exports = cutreports;
