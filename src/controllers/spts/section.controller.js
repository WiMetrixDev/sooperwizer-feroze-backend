'use strict';

const errors = require('../../validations/error-handler.js');

const errorHandler = errors.errorHandler;

const getErrorMessage = require('../../utils/getErrorMessage');

const get = async function(request, reply) {
  const SectionID = request.params.SectionID;
  try {
    const { recordset } = await readPool.request().query(`
      SELECT *
      FROM [Essentials].[Section]
      WHERE SectionID = ${SectionID};
    `);

    if (recordset[0]) {
      const message = errorHandler(recordset[0]);
      return message;
    } else {
      return reply.notFound('Section Does Not Exist!');
    }
  } catch (error) {
    const errorStr = error.toString();

    reply.internalServerError(errorStr);
  }
};

const getAll = async function(request, reply) {
  try {
    const data = await readPool.request().query(`SELECT TOP 1000 [SectionID]
    ,[SectionCode]
    ,[SectionDescription]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Section]`);

    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

/* Inserts One Or Many Operaion Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/

const add = async function(request, reply) {
  const { SectionCode, SectionDescription } = request.body;
  try {
    const data = await addPool.request()
      .query(`INSERT INTO [Essentials].[Section]
    ([SectionCode]
    ,[SectionDescription])
    VALUES
    ('${SectionCode}'
    ,'${SectionDescription}')`);
    const message = errorHandler(data);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const addMany = async function(req, reply) {
  try {
    const data = {
      successful: [],
      failed: [],
    };

    await Promise.all(
      req.body.map(async (row) => {
        try {
          await addPool.request().query(`INSERT INTO [Essentials].[Section]
                    ([SectionCode]
                    ,[SectionDescription])
                    VALUES
                    ('${row.SectionCode}'
                    ,'${row.SectionDescription}')`);
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
};

const update = async function(request, reply) {
  const SectionID = request.params.SectionID;
  const { SectionDescription } = request.body;

  try {
    const data = await readPool.request().query(`SELECT [SectionID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Section] WHERE SectionID = ${SectionID}`);
    if (data.recordset.length == 0) {
      return reply.notFound('Section Does Not Exist!');
    } else {
      const section = await addPool.request()
        .query(`UPDATE [Essentials].[Section]
      SET SectionDescription = '${SectionDescription}',
      UpdatedAt = getDate()
      WHERE SectionID = ${SectionID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const deleteOne = async function(request, reply) {
  const SectionID = request.params.SectionID;
  try {
    const section = await readPool.request().query(`SELECT [SectionID]
    ,[SectionCode]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Section] WHERE SectionID = ${SectionID}`);

    if (section.recordset.length == 0 || section.recordset == null) {
      reply.notFound('Section Does Not Exist!');
    }

    const operationExists = await readPool.request().query(`SELECT [SectionID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Operation] WHERE SectionID = ${SectionID}`);

    if (operationExists.recordset.length > 0) {
      reply.notFound('Operation Failed! Section Exists In Operation!');
    }

    const userExists = await readPool.request().query(`SELECT [SectionID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[User] WHERE SectionID = ${SectionID}`);

    if (userExists.recordset.length > 0) {
      reply.badRequest('Operation Failed! Section Exists In User!');
    }

    const faultExists = await readPool.request().query(`SELECT [SectionID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Fault] WHERE SectionID = ${SectionID}`);

    if (faultExists.recordset.length > 0) {
      reply.badRequest('Operation Failed! Section Exists In Fault!');
    }

    const auditFormSessionExists = await readPool.request()
      .query(`SELECT [SectionID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Data].[AuditFormSession] WHERE SectionID = ${SectionID}`);

    if (auditFormSessionExists.recordset.length > 0) {
      reply.badRequest('Operation Failed! Section Exists In AuditFormSession!');
    }

    const endLineSessionExists = await readPool.request()
      .query(`SELECT [SectionID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Data].[EndLineSession] WHERE SectionID = ${SectionID}`);

    if (endLineSessionExists.recordset.length > 0) {
      reply.badRequest('Operation Failed! Section Exists In EndLineSession!');
    } else {
      const data = await addPool.request()
        .query(`DELETE FROM [Essentials].[Section]
        WHERE SectionID = ${SectionID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const assignSections = async (request, reply) => {
  const { SectionID } = request.body;
  const Sections = JSON.parse(request.body.Sections);
  let query = '';
  try {
    query = `DELETE FROM Essentials.SectionMapping
        WHERE SectionID=${SectionID};`;
    await addPool.request().query(query);
    query = '';
    if (Sections.length != 0) {
      console.log('RS', Sections);
      Sections.map((section) => {
        query += `INSERT INTO Essentials.SectionMapping
        (SectionID, MappedSectionID)
        VALUES(${SectionID}, ${section});`;
      });
      // console.log(query);
      await addPool.request().query(query);
    }
    return errorHandler();
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const getAssignedSections = async (request, reply) => {
  const { SectionID } = request.params;
  let query = '';
  try {
    query = `SELECT MappedSectionID
        FROM Essentials.SectionMapping Where SectionID = ${SectionID}`;
    const sectionsAssigned = await addPool.request().query(query);
    return errorHandler(sectionsAssigned.recordset);
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

module.exports = {
  get,
  getAll,
  add,
  assignSections,
  getAssignedSections,
  addMany,
  update,
  deleteOne,
};
