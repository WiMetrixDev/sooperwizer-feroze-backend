'use strict';
const controllers = require('../../../controllers/floorOperations/DOMA/DOMAcontroller');

const DOMA = function controller(fastify, options, done) {
  fastify.post(
    '/DOMA/getAttendance',
    controllers.getAttendance,
  );

  fastify.post(
    '/DOMA/getThroughput',
    controllers.getThroughput,
  );

  fastify.post(
    '/DOMA/getWorkInProgress',
    controllers.getWorkInProgress,
  );

  fastify.post(
    '/DOMA/getFaultsAndDHU',
    controllers.getFaultsAndDHU,
  );

  fastify.post(
    '/DOMA/getInlineFaults/:LineID',
    controllers.getFaultsAndDHU,
  );

  fastify.post(
    '/DOMA/getInlineAudits',
    controllers.getInlineAudits,
  );

  fastify.post(
    '/DOMA/rightFirstTime',
    controllers.rightFirstTime,
  );

  //   fastify.delete(
  //     "/DOMA/deleteActiveLayout/:ActiveLayoutID",
  //     //DOMAValidationSchema.deleteOneDOMA,
  //     DOMAController.deleteActiveLayout
  //   );

  //   fastify.post(
  //     "/DOMA/addLayout",
  //     //DOMAValidationSchema.insertOneDOMA,
  //     DOMAController.addLayout
  //   );

  //   fastify.post(
  //     "/DOMA/addMachineTypeLayout",
  //     //DOMAValidationSchema.insertManyDOMA,
  //     DOMAController.addMachineTypeLayout
  //   );

  //   fastify.post(
  //     "/DOMA/addOperationLayout",
  //     // DOMAValidationSchema.updateOneDOMA,
  //     DOMAController.addOperationLayout
  //   );

  //   fastify.put(
  //     "/DOMA/updateMachineTypeLayout/:LayoutMachineTypeID",
  //     // DOMAValidationSchema.updateOneDOMA,
  //     DOMAController.updateMachineType
  //   );

  //   fastify.put(
  //     "/DOMA/updateOperationLayout/:LayoutOperationID",
  //     // DOMAValidationSchema.updateOneDOMA,
  //     DOMAController.updateOperationLayout
  //   );

  //   fastify.delete(
  //     "/DOMA/deleteMachineTypeLayout/:LayoutMachineTypeID",
  //     //DOMAValidationSchema.deleteOneDOMA,
  //     DOMAController.deleteMachineTypeLayout
  //   );

  //   fastify.delete(
  //     "/DOMA/deleteOperationLayout/:LayoutOperationID",
  //     //DOMAValidationSchema.deleteOneDOMA,
  //     DOMAController.deleteOperationLayout
  //   );

  //   fastify.delete(
  //     "/DOMA/deleteLayout/:LayoutID",
  //     //DOMAValidationSchema.deleteOneDOMA,
  //     DOMAController.deleteLayout
  //   );

  done();
};

module.exports = DOMA;
