'use strict';
const path = require('path');
const util = require('util');
const { kIsMultipart } = require('fastify-formidable');
const mv = require('mv');
const mvPromisified = util.promisify(mv);
const { errorHandler } = require('../../validations/error-handler.js');
const getErrorMessage = require('../../utils/getErrorMessage');
const uploadImage = require('../../utils/uploadImage.js');

module.exports = {
  get: async (request, reply) => {
    const OperationID = request.params.OperationID;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT
          op.*,
          d.DepartmentName,
          s.SectionCode,
          s.SectionDescription
        FROM [Essentials].[Operation] as op
          join Essentials.Department as d
            on op.DepartmentID = d.DepartmentID
          join Essentials.Section as s
            on op.SectionID = s.SectionID
        WHERE op.OperationID = ${OperationID};
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
      const data = await readPool.request()
        .query(`SELECT op.*,d.DepartmentName,s.SectionCode,s.SectionDescription
      FROM [Essentials].[Operation] as op
      join Essentials.Department as d on op.DepartmentID = d.DepartmentID
      join Essentials.Section as s on op.SectionID = s.SectionID`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  add: async (request, reply) => {
    try {
      const [imageColumnParams, imageValueParams] = await uploadImage(
        request,
        'Operation',
        request.body.OperationCode,
      );

      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[Operation]
          ([OperationCode]
          ,[OperationName]
          ,[OperationDescription]
          ,[DepartmentID]
          ,[PieceRate]
          ,[OperationType]
          ${imageColumnParams}
          ,[SectionID]
          ,[SMV]
          )
        VALUES
        ('${request.body.OperationCode}'
        ,'${request.body.OperationName}'
        ,'${request.body.OperationDescription}'
        ,${request.body.DepartmentID}
        ,${request.body.PieceRate}
        ,'${request.body.OperationType}'
        ${imageValueParams}
        ,${request.body.SectionID}
        ,${request.body.SMV})`);

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
            await addPool.request().query(`INSERT INTO [Essentials].[Operation]
                ([OperationCode]
                ,[OperationName]
                ,[OperationDescription]
                ,[DepartmentID]
                ,[PieceRate]
                ,[OperationType]
                ,[SectionID]
                ,[SMV])
                VALUES
                ('${row.OperationCode}'
                ,'${row.OperationName}'
                ,'${row.OperationDescription}'
                ,${row.DepartmentID}
                ,${row.PieceRate}
                ,'${row.OperationType}'
                ,${row.SectionID}
                ,${row.SMV}
                )`);
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
    const OperationID = parseInt(request.params.OperationID);
    const {
      OperationName,
      OperationDescription,
      Department,
      PieceRate,
      OperationType,
      OperationImageUrl,
      OperationThumbnailUrl,
      SectionID,
      SMV,
    } = request.body;
    try {
      const hasImage = false;
      const operationExists = await readPool.request()
        .query(`SELECT [OperationID],
        [OperationCode],
        [CreatedAt],
        [UpdatedAt]
    FROM [Essentials].[Operation] WHERE OperationID = ${OperationID}`);
      if (operationExists.recordset.length == 0) {
        return reply.notFound('Operation Failed! Operation Does Not Exist!');
      }
      const sectionExists = await readPool.request().query(`SELECT [SectionID]
        [CreatedAt],
        [UpdatedAt]
    FROM [Essentials].[Section] WHERE SectionID = ${parseInt(SectionID)}`);
      if (sectionExists.recordset.length == 0) {
        return reply.badRequest('Operation Failed! Section Does Not Exist!');
      }

      const imageParams = await uploadImage(
        request,
        'Operation',
        operationExists.recordset[0].OperationCode,
        true,
      );

      const updateOperation = await addPool.request()
        .query(`UPDATE [Essentials].[Operation]
      SET
      OperationDescription = '${request.body.OperationDescription}',
      DepartmentID = '${request.body.DepartmentID}',
      PieceRate = ${parseFloat(request.body.PieceRate)},
      SMV = ${parseFloat(request.body.SMV)},
      OperationType = '${request.body.OperationType}',
      SectionID = ${parseInt(request.body.SectionID)}
      ${imageParams},
      UpdatedAt = getDate()
      WHERE OperationID = ${OperationID}`);

      const message = errorHandler();
      return message;
    } catch (error) {
      console.log(error);
      return reply.internalServerError(error.message.toString());
    }
  },
  deleteOne: async function(request, reply) {
    const OperationID = request.params.OperationID;
    try {
      const operation = await readPool.request().query(`SELECT [OperationCode]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Operation] WHERE OperationID = ${OperationID}`);

      if (operation.recordset.length == 0) {
        return reply.notFound('Operation Does Not Exist!');
      }

      const machineOperation = await readPool.request()
        .query(`SELECT [CreatedAt]
    ,[UpdatedAt]
    FROM [Essentials].[MachineOperations] WHERE OperationID = ${OperationID}`);
      if (machineOperation.recordset.length > 0) {
        return reply.notFound(
          'Operation Failed! Operaion Exists in Machine Operations!',
        );
      }

      const auditFormSession = await readPool.request()
        .query(`SELECT [CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[AuditFormSession] WHERE OperationID = ${OperationID}`);
      if (auditFormSession.recordset.length > 0) {
        return reply.notFound('Operation Failed! Operaion Exists In Section!');
      }

      const scanExists = await readPool.request().query(`SELECT [CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[Scan] WHERE OperationID = ${OperationID}`);
      if (scanExists.recordset.length > 0) {
        return reply.notFound('Operation Failed! Operaion Exists In Scan!');
      }

      const pieceWiseScanExists = await readPool.request()
        .query(`SELECT [CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[PieceWiseScan] WHERE OperationID = ${OperationID}`);

      if (pieceWiseScanExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Operaion Exists In PieceWiseScan!',
        );
      }

      const styleBulletinExists = await readPool.request()
        .query(`SELECT [CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[StyleBulletin] WHERE OperationID = ${OperationID}`);

      if (styleBulletinExists.recordset.length > 0) {
        return reply.badRequest(
          'Operation Failed! Operaion Exists In StyleBulletin!',
        );
      } else {
        const data = await addPool.request()
          .query(`DELETE FROM [Essentials].[Operation]
          WHERE OperationID = ${OperationID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
