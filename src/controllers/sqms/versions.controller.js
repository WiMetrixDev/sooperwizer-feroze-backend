"use strict";
const errors = require("../../validations/error-handler");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");
module.exports = {
  getVersion: async (request, reply) => {
    const { appType } = request.params;
    try {
      // console.log(`select * from Essentials.AppVersion where AppType = '${appType}'`)
      const version = await readPool
        .request()
        .query(
          `select * from Essentials.AppVersion where AppType = '${appType}'`
        );
      //console.log(version)
      if (version.recordset.length > 0) {
        const message = errorHandler(version.recordset[0]);
        return message;
      } else {
        return reply.notFound("Versions Do Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
