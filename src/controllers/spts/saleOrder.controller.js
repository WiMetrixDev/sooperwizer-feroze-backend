"use strict";

const getErrorMessage = require("../../utils/getErrorMessage.js");
const errors = require("../../validations/error-handler.js");
const errorHandler = errors.errorHandler;

module.exports = {
  getOne: async (request, reply) => {
    const SaleOrderID = request.params.SaleOrderID;
    try {
      const data = await readPool.request().query(`SELECT *
      FROM [Essentials].[SaleOrder] WHERE SaleOrderID = ${SaleOrderID}`);
      if (data.recordset.length != 0) {
        const message = errorHandler(data.recordset[0]);
        return message;
      } else {
        return reply.notFound("SaleOrder Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT *
      FROM [Essentials].[SaleOrder]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  findDistinctCustomers: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT DISTINCT
      [Customer]
      FROM [Essentials].[SaleOrder]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  add: async (request, reply) => {
    const { SaleOrderCode, Customer, OrderQuantity } = request.body;
    try {
      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[SaleOrder]
      ([SaleOrderCode]
      ,[Customer]
      ,[OrderQuantity])
      VALUES
      ('${SaleOrderCode}'
      ,'${Customer}'
      ,${parseInt(OrderQuantity)})`);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  addMany: async (request, reply) => {
    try {
      const data = {
        successful: [],
        failed: [],
      };
      await Promise.all(
        request.body.map(async (row) => {
          try {
            await addPool.request().query(`INSERT INTO [Essentials].[SaleOrder]
            ([SaleOrderCode]
            ,[Customer]
            ,[OrderQuantity])
            VALUES
            ('${row.SaleOrderCode}'
            ,'${row.Customer}'
            ,${row.OrderQuantity})`);
            data.successful.push(row);
          } catch (error) {
            data.failed.push({
              ...row,
              error: error.message,
            });
          }
        })
      );
      const message = errorHandler(data);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  update: async (request, reply) => {
    const currentDate = new Date();
    const SaleOrderID = request.params.SaleOrderID;
    const { Customer, OrderQuantity } = request.body;

    try {
      const saleOrder = await readPool.request().query(`SELECT *
      FROM [Essentials].[SaleOrder] WHERE SaleOrderID = ${SaleOrderID}`);

      if (saleOrder.recordset.length == 0) {
        reply.notFound("SaleOrder Does Not Exist!");
      } else {
        const saleOrder = await addPool.request()
          .query(`UPDATE [Essentials].[SaleOrder]
                  SET [Customer] = '${Customer}'
                      ,[OrderQuantity] = ${parseInt(OrderQuantity)}
                      ,[UpdatedAt] = getDate()
                  WHERE SaleOrderID = ${SaleOrderID}`);

        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  delete: async (request, reply) => {
    const SaleOrderID = request.params.SaleOrderID;
    try {
      const saleOrder = await readPool.request().query(`SELECT *
      FROM [Essentials].[SaleOrder] WHERE SaleOrderID = ${SaleOrderID}`);
      if (saleOrder.recordset.length == 0) {
        return reply.notFound("SaleOrder Does Not Exist!");
      }
      const productionOrderExists = await readPool.request().query(`SELECT *
      FROM [Essentials].[ProductionOrder] WHERE SaleOrderID = ${SaleOrderID}`);
      if (productionOrderExists.recordset.length > 0) {
        return reply.badRequest(
          "Operation Failed! Sale Order Exists In ProductionOrder!"
        );
      }
      const deletedSaleOrder = await addPool.request().query(
        `DELETE FROM [Essentials].[SaleOrder]
          WHERE SaleOrderID = ${SaleOrderID}`
      );
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
