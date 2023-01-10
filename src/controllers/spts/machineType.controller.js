'use strict';

const errors = require('../../validations/error-handler');

const errorHandler = errors.errorHandler;

const getErrorMessage = require('../../utils/getErrorMessage');

module.exports = {
  get: async (request, reply) => {
    const { MachineTypeID } = request.params;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[MachineType]
        WHERE MachineTypeID = ${MachineTypeID};
      `);
      if (recordset[0]) {
        const message = errorHandler(recordset[0]);
        return message;
      } else {
        return reply.notFound('MachineType Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT [MachineTypeID]
      ,[MachineTypeCode]
      ,[MachineTypeDescription]
      ,[Allowance]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[MachineType]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  add: async (request, reply) => {
    const { MachineTypeCode, MachineTypeDescription, Allowance } = request.body;
    try {
      const data = await addPool.request()
        .query(`INSERT INTO [Essentials].[MachineType]
      ([MachineTypeCode]
      ,[MachineTypeDescription]
      ,[Allowance])
      VALUES
      ('${MachineTypeCode}'
      ,'${MachineTypeDescription}'
      ,${Allowance})`);
      const message = errorHandler(data);
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
            await addPool.request()
              .query(`INSERT INTO [Essentials].[MachineType]
            ([MachineTypeCode]
            ,[MachineTypeDescription]
            ,[Allowance])
            VALUES
            ('${row.MachineTypeCode}'
            ,'${row.MachineTypeDescription}'
            ,${row.Allowance})`);
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
    const MachineTypeID = request.params.MachineTypeID;
    const { MachineTypeCode, MachineTypeDescription, Allowance } = request.body;
    try {
      const machineType = await readPool.request().query(`SELECT [MachineTypeID]
        ,[CreatedAt]
        ,[UpdatedAt]
    FROM [Essentials].[MachineType] WHERE MachineTypeID = ${MachineTypeID}`);
      if (machineType.recordset.length == 0) {
        reply.notFound('Machine Does Not Exist!');
      } else {
        const data = await addPool.request()
          .query(`UPDATE [Essentials].[MachineType]
        SET
        MachineTypeDescription = '${MachineTypeDescription}',
        Allowance = ${Allowance},
        UpdatedAt = getDate()
        WHERE MachineTypeID = ${MachineTypeID}`);
        const message = errorHandler(data);
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  deleteOne: async function(request, reply) {
    const MachineTypeID = request.params.MachineTypeID;
    try {
      const machineType = await readPool.request().query(`SELECT [MachineTypeID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[MachineType] WHERE MachineTypeID = ${MachineTypeID}`);

      if (machineType.recordset.length == 0 || machineType.recordset == null) {
        return reply.notFound('MachineType Does Not Exist!');
      }

      const machineExists = await readPool.request()
        .query(`SELECT [MachineTypeID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Machine] WHERE MachineTypeID = ${MachineTypeID}`);

      if (machineExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! MachineType Already Exists In Machine!',
        );
      }
      const styleBulletinExists = await readPool.request()
        .query(`SELECT [MachineTypeID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[StyleBulletin] WHERE MachineTypeID = ${MachineTypeID}`);

      if (styleBulletinExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! MachineType Already Exists In StyleBulletin!',
        );
      } else {
        const deletedMachineType = await addPool.request()
          .query(`DELETE FROM [Essentials].[MachineType]
        WHERE MachineTypeID = ${MachineTypeID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
