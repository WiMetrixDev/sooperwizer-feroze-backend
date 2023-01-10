'use strict';

const errors = require('../../validations/error-handler');

const errorHandler = errors.errorHandler;

const getErrorMessage = require('../../utils/getErrorMessage');

module.exports = {
  get: async (request, reply) => {
    const LineID = request.params.LineID;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[Line]
        WHERE LineID = ${LineID};
      `);
      if (recordset[0]) {
        const message = errorHandler(recordset[0]);
        return message;
      } else {
        return reply.notFound('Line Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT [LineID]
      ,[LineCode]
      ,[LineDescription]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Line]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  add: async (request, reply) => {
    const { LineCode, LineDescription } = request.body;
    try {
      const data = await addPool.request()
        .query(`INSERT INTO [Essentials].[Line]
      ([LineCode]
      ,[LineDescription])
      VALUES
      ('${LineCode}'
      ,'${LineDescription}')`);
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
            await addPool.request().query(`INSERT INTO [Essentials].[Line]
                ([LineCode]
                ,[LineDescription])
                VALUES
                ('${row.LineCode}'
                ,'${row.LineDescription}')`);
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
    const LineID = request.params.LineID;
    const { LineDescription } = request.body;
    try {
      const line = await readPool.request().query(`SELECT [LineID]
      ,[LineCode]
      ,[LineDescription]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Line] WHERE LineID = ${LineID}`);
      if (line.recordset.length == 0) {
        reply.notFound('Line Does Not Exist!');
      } else {
        const data = await addPool.request().query(`UPDATE [Essentials].[Line]
        SET LineDescription = '${LineDescription}',
        UpdatedAt = getDate()
        WHERE LineID = ${LineID}`);
        const message = errorHandler(data);
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  deleteOne: async function(request, reply) {
    const LineID = request.params.LineID;
    try {
      const line = await readPool.request().query(`SELECT [LineID]
      ,[LineCode]
      ,[LineDescription]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Line] WHERE LineID = ${LineID}`);

      if (line.recordset.length == 0 || line.recordset == null) {
        return reply.notFound('Line Does Not Exist!');
      }

      const userExists = await readPool.request().query(`SELECT [LineID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[User] WHERE LineID = ${LineID}`);

      if (userExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Line Already Exists In User!',
        );
      }

      const workerScanExists = await readPool.request().query(`SELECT [LineID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[WorkerScan] WHERE LineID = ${LineID}`);

      if (workerScanExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Line Already Exists In WorkerScan!',
        );
      }

      const machineExists = await readPool.request().query(`SELECT [LineID]
  ,[CreatedAt]
  ,[UpdatedAt]
FROM [Essentials].[Machine] WHERE LineID = ${LineID}`);

      if (machineExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Line Already Exists In Machine!',
        );
      }

      const scanExists = await readPool.request().query(`SELECT [LineID]
  ,[CreatedAt]
  ,[UpdatedAt]
FROM [Data].[Scan] WHERE LineID = ${LineID}`);

      if (scanExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Line Already Exists In Scan!',
        );
      }

      const pieceWiseScanExists = await readPool.request()
        .query(`SELECT [LineID]
      ,[CreatedAt]
      ,[UpdatedAt]
    FROM [Data].[PieceWiseScan] WHERE LineID = ${LineID}`);

      if (pieceWiseScanExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Line Already Exists In PieceWiseScan!',
        );
      }
      const targetFeeding = await readPool.request().query(`SELECT [LineID]
    ,[CreatedAt]
    ,[UpdatedAt]
  FROM [Essentials].[TargetFeeding] WHERE LineID = ${LineID}`);

      if (targetFeeding.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Line Already Exists In TargetFeeding!',
        );
      } else {
        const deletedLine = await addPool.request()
          .query(`DELETE FROM [Essentials].[Line]
        WHERE LineID = ${LineID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
