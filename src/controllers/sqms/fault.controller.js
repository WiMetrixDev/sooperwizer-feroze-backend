'use strict';

const errors = require('../../validations/error-handler');
const errorHandler = errors.errorHandler;
const getErrorMessage = require('../../utils/getErrorMessage');

module.exports = {
  get: async (request, reply) => {
    const FaultID = request.params.FaultID;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT
          F.[FaultID],
          F.[FaultCode],
          F.[FaultDescription],
          S.[SectionID],
          S.[SectionDescription],
          S.[SectionCode],
          F.[CreatedAt],
          F.[UpdatedAt]
        FROM [Essentials].[Fault] as F
        INNER JOIN [Essentials].Section as S
          ON F.SectionID = S.SectionID
        WHERE F.[FaultID] = ${FaultID};
      `);
      if (recordset[0]) {
        const message = errorHandler(recordset[0]);
        return message;
      } else {
        return reply.notFound('Box Does Not Exist!');
      }
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  getAll: async (request, reply) => {
    try {
      const query = `
        SELECT [FaultID]
        ,[FaultCode]
        ,[FaultDescription]
        ,S.[SectionID]
        ,S.[SectionDescription]
        ,S.[SectionCode]
        ,F.[CreatedAt]
        ,F.[UpdatedAt]
        FROM [Essentials].[Fault] as F
        INNER JOIN [Essentials].Section as S
        ON F.SectionID = S.SectionID
      `;
      const data = await readPool.request().query(query);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  add: async (request, reply) => {
    const { FaultCode, FaultDescription, SectionID } = request.body;
    try {
      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[Fault]
        ([FaultCode]
        ,[FaultDescription]
        ,[SectionID])
        VALUES
        ('${request.body.FaultCode}'
        ,'${request.body.FaultDescription}'
        ,${request.body.SectionID})`);

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.toString());
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
            await addPool.request().query(`INSERT INTO [Essentials].[Fault]
                  ([FaultCode]
                  ,[FaultDescription]
                  ,[SectionID])
                  VALUES
                  ('${row.FaultCode}'
                  ,'${row.FaultDescription}'
                  ,${row.SectionID})`);
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
      return reply.internalServerError(error.toString());
    }
  },
  update: async (request, reply) => {
    try {
      const FaultID = request.params.FaultID;
      const { FaultDescription, SectionID } = request.body;

      const data = await addPool.request().query(`UPDATE [Essentials].[Fault]
      SET FaultDescription = '${FaultDescription}',
      SectionID = ${SectionID},
      UpdatedAt = getdate()
      WHERE FaultID = ${FaultID}`);

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error);
    }
  },

  delete: async (request, reply) => {
    try {
      const FaultID = parseInt(request.params.FaultID);

      const faultExists = await readPool.request().query(`SELECT [FaultID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Fault] WHERE FaultID = ${FaultID}`);

      if (faultExists.recordset.length == 0) {
        return reply.badRequest('Operation Failed! Fault Does Not Exist!');
      }

      const auditFormFaultLogExists = await readPool.request()
        .query(`SELECT [AuditFormFaultLogID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[AuditFormFaultLog] WHERE FaultID = ${FaultID}`);

      if (auditFormFaultLogExists.recordset.length > 0) {
        return reply.badRequest(
          'Can Not Delete! Fault Already Exists In Audit Form Fault Log!',
        );
      } else {
        const deletedObject = await addPool.request()
          .query(`DELETE FROM [Essentials].[Fault]
        WHERE FaultID = ${FaultID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      const errorStr = error.toString();

      return reply.internalServerError(errorStr);
    }
  },
};
