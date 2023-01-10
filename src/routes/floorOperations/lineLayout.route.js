'use strict';
const controllers = require('../../controllers/floorOperations/lineLayout.controller');

const lineLayout = function controller(fastify, options, done) {
  fastify.get(
    '/lineLayout/getLayoutDetailByID/:LayoutID',
    controllers.getLayoutDetailByID,
  );

  fastify.get(
    '/lineLayout/getAllLayouts',
    controllers.getAllLayouts,
  );

  fastify.get(
    '/lineLayout/getLayoutByStyleTemplateID/:StyleTemplateID',
    controllers.getLayoutByStyleTemplateID,
  );

  fastify.post(
    '/lineLayout/getActiveLayoutsByMachineIDs',
    controllers.getActiveLayoutsByMachineIDs,
  );

  fastify.get(
    '/lineLayout/getActiveLayouts/:LineID',
    controllers.getActiveLayouts,
  );

  fastify.get(
    '/lineLayout/getActiveLayoutsByParentStyleTemplateID/:ParentStyleTemplateID',
    controllers.getActiveLayoutsByParentStyleTemplateID,
  );

  fastify.post(
    '/lineLayout/setActiveLayout',
    controllers.setActiveLayouts,
  );

  fastify.post(
    '/lineLayout/addLayout',
    controllers.addLayout,
  );

  fastify.post(
    '/lineLayout/addMachineTypeLayout',
    controllers.addMachineTypeLayout,
  );

  fastify.post(
    '/lineLayout/addOperationLayout',
    controllers.addOperationLayout,
  );

  fastify.put(
    '/lineLayout/updateMachineTypeLayout/:LayoutMachineTypeID',
    controllers.updateMachineType,
  );

  fastify.put(
    '/lineLayout/updateOperationLayout/:LayoutOperationID',
    controllers.updateOperationLayout,
  );

  fastify.delete(
    '/lineLayout/deleteMachineTypeLayout/:LayoutMachineTypeID',
    controllers.deleteMachineTypeLayout,
  );

  fastify.delete(
    '/lineLayout/deleteOperationLayout/:LayoutOperationID',
    controllers.deleteOperationLayout,
  );

  fastify.delete(
    '/lineLayout/deleteLayout/:LayoutID',
    controllers.deleteLayout,
  );

  fastify.put(
    '/lineLayout/deactivateLayout/:ActiveLayoutID',
    controllers.deactivateLayout,
  );

  done();
};

module.exports = lineLayout;
