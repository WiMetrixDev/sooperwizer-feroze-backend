"use strict";
const errors = require("../../validations/error-handler");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");
module.exports = {
  findScansByProductionOrderID: async (request, reply) => {
    const { ProductionOrderID } = request.params;
    let message;
    try {
      let getScans = await readPool.request()
        .query(`select * from Data.PieceWiseScan as pws join
            Essentials.CutReport as cr on cr.BundleID = pws.BundleID join Essentials.CutJob as cj
            on cj.CutJobID = cr.CutJobID join Essentials.ProductionOrder as po on
            po.ProductionOrderID = cj.ProductionOrderID where po.ProductionOrderID = '${ProductionOrderID}'`);

      if (getScans.recordset.length == 0) {
        message = {
          statusCode: 200,
          error: "No Scannings Found!",
          message: "Not Found!",
        };
      } else {
        message = errorHandler(getScans.recordset[0]);
      }
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
};
