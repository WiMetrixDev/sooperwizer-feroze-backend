'use strict';

const errors = require('../../validations/error-handler');
const errorHandler = errors.errorHandler;
const getErrorMessage = require('../../utils/getErrorMessage');

module.exports = {
  get: async (request, reply) => {
    const BoxID = request.params.BoxID;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[Box]
        WHERE BoxID = ${BoxID}
      `);
      if (recordset[0]) {
        return errorHandler(recordset[0]);
      } else {
        return reply.notFound('Box Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT [BoxID]
        ,[BoxCode]
        ,[IssueDate]
        ,[CreatedAt]
        ,[UpdatedAt]
    FROM [Essentials].[Box]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      return reply.internalServerError(errorStr);
    }
  },
  add: async (request, reply) => {
    const { BoxCode, IssueDate } = request.body;
    try {
      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[Box]
      ([BoxCode]
      ,[IssueDate])
      VALUES
      ('${BoxCode}'
      ,'${IssueDate}')`);
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
            await addPool.request().query(`INSERT INTO [Essentials].[Box]
                ([BoxCode]
                ,[IssueDate])
                VALUES
                ('${row.BoxCode}'
                ,'${row.IssueDate}')`);
            data.successful.push(row);
          } catch (error) {
            data.failed.push({
              ...row,
              error: error.message,
            });
          }
        }),
      );
      const message = errorHandler(data);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  update: async (request, reply) => {
    const BoxID = request.params.BoxID;
    const IssueDate = request.body.IssueDate;
    try {
      const box = await readPool.request().query(`SELECT [BoxID]
      ,[BoxCode]
      ,[IssueDate]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Box] WHERE BoxID = ${BoxID}`);

      if (box.recordset.length == 0) {
        return reply.notFound('Box Does Not Exist!');
      }

      const update = await addPool.request().query(`UPDATE [Essentials].[Box]
      SET IssueDate = '${IssueDate}',
      UpdatedAt = getDate()
      WHERE BoxID = ${BoxID}`);

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  delete: async (request, reply) => {
    const BoxID = request.params.BoxID;
    try {
      const box = await readPool.request().query(`SELECT [BoxID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Box] WHERE BoxID = ${BoxID}`);
      if (box.recordset.length == 0) {
        return reply.notFound('Box Does Not Exist!');
      }
      const machineExists = await readPool.request().query(`SELECT [BoxID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Machine] WHERE BoxID = ${BoxID}`);
      if (machineExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Box Already Exists In Machine!',
        );
      }
      const deletedBox = await addPool.request()
        .query(`DELETE FROM [Essentials].[Box]
    WHERE BoxID = ${BoxID}`);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
