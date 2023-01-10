'use strict';

const controllers = require('../../controllers/spts/styleTemplate.controller');

const styletemplates = function controller(fastify, options, done) {
  fastify.get(
    '/styletemplates/findOne/:StyleTemplateID',
    controllers.findStyleTemplateByID,
  );
  fastify.get(
    '/styletemplates/findAll',
    controllers.findAllStyleTemplates,
  );
  fastify.get(
    '/styletemplates/findAvailableStyleTemplates',
    controllers.findAvailableStyleTemplates,
  );
  fastify.get(
    '/styletemplates/findAvailableParentStyleTemplates',
    controllers.findAvailableParentStyleTemplates,
  );
  fastify.get(
    '/styletemplates/findVariationsForParentStyleTemplate/:ParentStyleTemplateID',
    controllers.findVariationsForParentStyleTemplate,
  );
  fastify.post(
    '/styletemplates/insertOne',
    controllers.insertOneStyleTemplate,
  );
  fastify.post(
    '/styletemplates/insertWithVariant',
    controllers.insertWithVariant,
  );
  fastify.delete(
    '/styletemplates/deleteOne/:StyleTemplateID',
    controllers.deleteOneStyleTemplate,
  );
  fastify.post(
    '/styletemplates/updateVariant',
    controllers.updateVariant,
  );
  fastify.get(
    '/styletemplates/findAllParentStyleTemplates',
    controllers.findAllParentStyleTemplates,
  );
  done();
};

module.exports = styletemplates;
