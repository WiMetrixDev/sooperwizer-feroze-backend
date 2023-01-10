"use strict";

const errors = require("../../validations/error-handler.js");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");

const get = async function (request, reply) {
  const ColorID = request.params.SectionID;
  try {
    const data = await readPool.request().query(`SELECT *
FROM [Essentials].[Color] WHERE ColorID = ${ColorID}`);

    if (data.recordset.length > 0) {
      const message = errorHandler(data.recordset);
      return message;
    } else {
      return reply.notFound("Color Does Not Exist!");
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
      .query(`SELECT * FROM [Essentials].[Color]`);

    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

/* Inserts One Or Many Operaion Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/

const add = async function (request, reply) {
  const Color = request.body.Color;
  try {
    const data = await addPool.request().query(`BEGIN
      IF NOT EXISTS (SELECT * FROM [Essentials].[Color] 
                      WHERE Color = '${Color}')
      BEGIN
        INSERT INTO [Essentials].[Color]
        ([Color])
        OUTPUT Inserted.ColorID
        VALUES
        ('${Color}')
      END
    END`);
    if (data.recordsets.length == 0) {
      return reply.badRequest("Operation Failed! Data Already Exists!");
    } else {
      const message = errorHandler(data);
      return message;
    }
  } catch (error) {
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
          IF NOT EXISTS (SELECT * FROM [Essentials].[Color] 
                          WHERE Color = '${row.Color}')
          BEGIN
            INSERT INTO [Essentials].[Color]
            ([Color])
            VALUES
            ('${row.Color}')
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
  const ColorID = request.params.ColorID;
  const Color = request.body.Color;

  try {
    const data = await readPool.request().query(`SELECT [ColorID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Color] WHERE ColorID = ${ColorID}`);
    if (data.recordset.length == 0) {
      return reply.notFound("Color Does Not Exist!");
    } else {
      const section = await addPool.request().query(`UPDATE [Essentials].[Color]
      SET Color = '${Color}',
      UpdatedAt = getDate()
      WHERE ColorID = ${ColorID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const deleteOne = async function (request, reply) {
  const ColorID = request.params.ColorID;
  try {
    const section = await readPool.request().query(`SELECT [ColorID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[Color] WHERE ColorID = ${ColorID}`);

    if (section.recordset.length == 0 || section.recordset == null) {
      reply.notFound("Color Does Not Exist!");
    } else {
      const data = await addPool.request()
        .query(`DELETE FROM [Essentials].[Color]
        WHERE ColorID = ${ColorID}`);
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
