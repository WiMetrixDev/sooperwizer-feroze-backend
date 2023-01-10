'use strict';

const errors = require('../../validations/error-handler');
const errorHandler = errors.errorHandler;
const getErrorMessage = require('../../utils/getErrorMessage');

module.exports = {
  get: async (request, reply) => {
    const { DepartmentID } = request.params;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[Department]
        WHERE DepartmentID = ${DepartmentID};
      `);
      if (recordset[0]) {
        return errorHandler(recordset[0]);
      } else {
        return reply.notFound('Department Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT [DepartmentID]
      ,[DepartmentName]
      ,[CreatedAt]
      ,[UpdatedAt]
    FROM [Essentials].[Department]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  add: async (request, reply) => {
    const DepartmentName = request.body.DepartmentName;
    try {
      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[Department]
      ([DepartmentName])
      VALUES
      ('${DepartmentName}')`);
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
            await addPool.request().query(`INSERT INTO [Essentials].[Department]
                ([DepartmentName])
                VALUES
                ('${row.DepartmentName}')`);
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
    const DepartmentID = request.params.DepartmentID;
    const DepartmentName = request.body.DepartmentName;
    try {
      const department = await readPool.request().query(`SELECT [DepartmentID]
      ,[DepartmentName]
  FROM [Essentials].[Department] WHERE DepartmentID = ${DepartmentID}`);

      if (department.recordset.length == 0) {
        return reply.notFound('Department Does Not Exist!');
      }
      const update = await addPool.request()
        .query(`UPDATE [Essentials].[Department]
      SET DepartmentName = '${DepartmentName}',
      UpdatedAt = getDate()
      WHERE DepartmentID = ${DepartmentID}`);

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  delete: async (request, reply) => {
    const DepartmentID = request.params.DepartmentID;
    try {
      const department = await readPool.request().query(`SELECT [DepartmentID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Department] WHERE DepartmentID = ${DepartmentID}`);
      if (department.recordset.length == 0) {
        return reply.notFound('Department Does Not Exist!');
      }
      const operationExists = await readPool.request()
        .query(`SELECT [DepartmentID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Operation] WHERE DepartmentID = ${DepartmentID}`);
      if (operationExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Department Already Exists In Operations!',
        );
      }
      const deletedDepartment = await addPool.request()
        .query(`DELETE FROM [Essentials].[Department]
    WHERE DepartmentID = ${DepartmentID}`);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
