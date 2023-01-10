"use strict";

const errors = require("../../validations/error-handler.js");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");

const get = async function (request, reply) {
  const SizeID = request.params.SectionID;
  try {
    const data = await readPool.request().query(`SELECT *
FROM [Essentials].[Size] WHERE SizeID = ${SizeID}`);

    if (data.recordset.length > 0) {
      const message = errorHandler(data.recordset);
      return message;
    } else {
      return reply.notFound("Size Does Not Exist!");
    }
  } catch (error) {
    const errorStr = error.toString();

    reply.internalServerError(errorStr);
  }
};

const getAll = async function (request, reply) {
  try {
    const data = await readPool
      .request()
      .query(`SELECT * FROM [Essentials].[Size]`);

    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

/* Inserts One Or Many Operaion Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/

const add = async function (request, reply) {
  const Size = request.body.Size;
  //console.log(request.body)
  try {
    const data = await addPool.request().query(`BEGIN
      IF NOT EXISTS (SELECT * FROM [Essentials].[Size] 
                      WHERE Size = '${Size}')
      BEGIN
        INSERT INTO [Essentials].[Size]
        ([Size])
        OUTPUT Inserted.SizeID
        VALUES
        ('${Size}')
      END
    END`);
    if (data.recordsets.length == 0) {
      return reply.badRequest("Operation Failed! Data Already Exists!");
    } else {
      const message = errorHandler(data);
      return message;
    }
  } catch (error) {
    console.log(error);
    return reply.internalServerError(error.message.toString());
  }
};

const addMany = async function (req, reply) {
  try {
    const data = {
      successful: [],
      failed: [],
    };

    await Promise.all(
      req.body.map(async (row) => {
        try {
          await addPool.request().query(`BEGIN
          IF NOT EXISTS (SELECT * FROM [Essentials].[Size] 
                          WHERE Size = ${row.Size})
          BEGIN
            INSERT INTO [Essentials].[Size]
            ([Size])
            VALUES
            ('${row.Size}')
          END
        END`);
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
};

const update = async function (request, reply) {
  const SizeID = request.params.SizeID;
  const Size = request.body.Size;

  try {
    const data = await readPool.request().query(`SELECT [SizeID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Size] WHERE SizeID = ${SizeID}`);
    if (data.recordset.length == 0) {
      return reply.notFound("Size Does Not Exist!");
    } else {
      const section = await addPool.request().query(`UPDATE [Essentials].[Size]
      SET Size = '${Size}',
      UpdatedAt = getDate()
      WHERE SizeID = ${SizeID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const deleteOne = async function (request, reply) {
  const SizeID = request.params.SizeID;
  try {
    const section = await readPool.request().query(`SELECT [SizeID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Size] WHERE SizeID = ${SizeID}`);

    if (section.recordset.length == 0 || section.recordset == null) {
      reply.notFound("Size Does Not Exist!");
    } else {
      const data = await addPool.request()
        .query(`DELETE FROM [Essentials].[Size]
        WHERE SizeID = ${SizeID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

module.exports = {
  get,

  getAll,

  add,

  addMany,

  update,

  deleteOne,
};
