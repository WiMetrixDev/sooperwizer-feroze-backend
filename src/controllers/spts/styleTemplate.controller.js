"use strict";

const errors = require("../../validations/error-handler");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");

const findStyleTemplateByID = async function (request, reply) {
  const StyleTemplateID = request.params.StyleTemplateID;
  try {
    const data = await readPool.request()
      .query(`select sb.*,mt.MachineTypeCode,op.OperationCode,op.OperationDescription from [Essentials].StyleBulletin as sb
      join [Essentials].MachineType as mt on sb.MachineTypeID = mt.MachineTypeID
      join Essentials.Operation as op on sb.OperationID = op.OperationID WHERE StyleTemplateID = ${StyleTemplateID}`);
    if (data) {
      const message = errorHandler(data.recordset);
      return message;
    } else {
      return reply.notFound("StyleTemplate Does Not Exist!");
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const findAllStyleTemplates = async (request, reply) => {
  try {
    const data = await readPool.request().query(`SELECT *
      FROM [Essentials].[StyleTemplate]`);
    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const findAllParentStyleTemplates = async (request, reply) => {
  try {
    const data = await readPool.request().query(`SELECT *
      FROM [Essentials].[ParentStyleTemplate]`);
    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const findAvailableStyleTemplates = async (request, reply) => {
  try {
    const data = await readPool.request()
      .query(`SELECT StyleTemplateID, StyleTemplateCode
    FROM [Essentials].[StyleTemplate]
    ORDER BY "StyleTemplateID" DESC`);

    const message = errorHandler(data.recordset);
    return message;

    // await models.StyleBulletin.findAll({
    //   attributes: ["StyleTemplateID", "StyleTemplateCode"],
    //   group: ["StyleTemplateID", "StyleTemplateCode"],
    //   order: [["StyleTemplateID", "DESC"]],
    // });

    // return res.status(200).json({
    //   error: errors.success,
    //   data: availableStyleTemplates,
    // });
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const findAvailableParentStyleTemplates = async (request, reply) => {
  const ParentStyleTemplateID = request.params.ParentStyleTemplateID;
  try {
    const data = await readPool.request()
      .query(`SELECT ParentStyleTemplateID, ParentStyleTemplateDescription
    FROM [Essentials].[ParentStyleTemplate]
    ORDER BY "ParentStyleTemplateID" DESC`);

    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const findVariationsForParentStyleTemplate = async (request, reply) => {
  const ParentStyleTemplateID = request.params.ParentStyleTemplateID;
  try {
    const data = await readPool.request().query(`SELECT *
      FROM [Essentials].[StyleTemplate]
      WHERE ParentStyleTemplateID = ${ParentStyleTemplateID}`);
    if (data.recordset.length == 0) {
      return reply.notFound("Data Does Not Exist!");
    } else {
      const message = errorHandler(data.recordset);
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

/* Inserts One Or Many Operaion Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/
const insertOneStyleTemplate = async function (request, reply) {
  const StyleTemplateCode = request.body.StyleTemplateCode;
  const styleBulletins = request.body.StyleBulletins;
  const data = {
    successful: [],
    failed: [],
  };

  try {
    let insertStyleTemplate = await addPool.request().query(`
    INSERT INTO [Essentials].[StyleTemplate]
    ([StyleTemplateCode])
    OUTPUT INSERTED.[StyleTemplateID]
    VALUES
    ('${StyleTemplateCode}')
    `);

    if (insertStyleTemplate.recordset.length > 0) {
      await Promise.all(
        styleBulletins.map(async (row) => {
          try {
            await addPool.request()
              .query(`INSERT INTO [Essentials].[StyleBulletin]
          ([StyleTemplateID]
          ,[OperationID]
          ,[OperationSequence]
          ,[ScanType]
          ,[IsFirst]
          ,[IsLast]
          ,[MachineTypeID]
          ,[SMV]
          ,[PieceRate])
      VALUES
          (${insertStyleTemplate.recordset[0].StyleTemplateID}
          ,${row.OperationID}
          ,${row.OperationSequence}
          ,'${row.ScanType}'
          ,${row.IsFirst ? 1 : 0}
          ,${row.IsLast ? 1 : 0}
          ,${row.MachineTypeID}
          ,${row.SMV}
          ,${row.PieceRate}
          )`);
            data.successful.push(row);
          } catch (error) {
            // const errorMessage = getErrorMessage(error);
            data.failed.push({
              ...row,
              error: error.message,
            });
          }
        })
      );
    }

    const message = errorHandler(data);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const insertWithVariant = async (request, reply) => {
  const {
    ParentStyleTemplateDescription,
    data,
    isVariant,
    VariantDescription,
  } = request.body;
  console.log(request.body);
  try {
    let max = -1;

    data.map((operation) => {
      if (operation.OperationSequence > max) max = operation.OperationSequence;
    });
    let ParentStyleTemplateID;
    if (!isVariant) {
      const addedParentStyleTemplate = await addPool.request()
        .query(`INSERT INTO [Essentials].[ParentStyleTemplate]
  ([ParentStyleTemplateDescription])
    OUTPUT INSERTED.ParentStyleTemplateID
    VALUES
  ('${ParentStyleTemplateDescription}')`);

      const mappedData = data.map((row) => ({
        ParentStyleTemplateID:
          addedParentStyleTemplate.recordset[0].ParentStyleTemplateID,
        ...row,
      }));
      ParentStyleTemplateID =
        addedParentStyleTemplate.recordset[0].ParentStyleTemplateID;

      let insertionIntoParentStyleTemplateDetail = "";
      mappedData.forEach(async (row) => {
        insertionIntoParentStyleTemplateDetail += `INSERT INTO [Essentials].[ParentStyleTemplateDetail]
          ([ParentStyleTemplateID],
              [OperationID],
              [OperationSequence],
              [ScanType],
              [IsFirst]
            ,[IsLast]
            ,[MachineTypeID]
            ,[SMV]
            ,[PieceRate]
            ,[IsCritical])
          VALUES
          (${row.ParentStyleTemplateID},
              ${row.OperationID},
              ${row.OperationSequence},
              '${row.ScanType}',
              ${row.IsFirst ? 1 : 0},
              ${row.IsLast ? 1 : 0},
              ${row.MachineTypeID},
              ${row.SMV},
              ${row.PieceRate},
              ${row.IsCritical ? 1 : 0}
              );`;
      });

      const addedData = await addPool
        .request()
        .query(insertionIntoParentStyleTemplateDetail);
    } else {
      ParentStyleTemplateID = request.body.ParentStyleTemplateID;
    }

    console.log(ParentStyleTemplateID);
    const addedStyleTemplate = await addPool.request()
      .query(`INSERT INTO [Essentials].[StyleTemplate]
              ([StyleTemplateCode],
                [ParentStyleTemplateID])
              OUTPUT INSERTED.StyleTemplateID
              VALUES
              ('${VariantDescription}',
              ${ParentStyleTemplateID})`);

    const mappedData = data.map((row) => ({
      StyleTemplateID: addedStyleTemplate.recordset[0].StyleTemplateID,
      StyleTemplateCode: VariantDescription,
      ...row,
    }));

    let styleBulletinInsertion = "";
    mappedData.forEach(async (row) => {
      styleBulletinInsertion =
        styleBulletinInsertion +
        `INSERT INTO [Essentials].[StyleBulletin]
      (
        [StyleTemplateID]
        ,[OperationID]
        ,[OperationSequence]
        ,[ScanType]
        ,[IsFirst]
        ,[IsLast]
        ,[MachineTypeID]
        ,[SMV]
        ,[PieceRate]
        ,[IsCritical]
      )
        VALUES(
            ${row.StyleTemplateID},
            ${row.OperationID},
            ${row.OperationSequence},
           '${row.ScanType}',
            ${row.IsFirst ? 1 : 0},
            ${row.IsLast ? 1 : 0},
            ${row.MachineTypeID},
            ${row.SMV},
            ${row.PieceRate},
            ${row.IsCritical ? 1 : 0}
        )
      `;
    });
    await addPool.request().query(styleBulletinInsertion);

    let returnData = mappedData;

    const message = errorHandler(returnData);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const updateVariant = async (request, reply) => {
  const {
    data,
    VariantID,
  } = request.body;
  try {
    if (!Array.isArray(data)) {
      throw new Error('Incorrect variant data received. must be array');
    }

    // const scanning = await addPool.request().query(`
    //   SELECT TOP 1 PieceWiseScanningID
    //   FROM Data.PieceWiseScan
    //   WHERE BundleID in (
    //     SELECT BundleID
    //     FROM Essentials.CutReport
    //     WHERE StyleTemplateID = ${VariantID}
    //   );
    // `);
    // if (scanning.recordset?.length > 0) {
    //   throw new Error('Can not update variant! Some associated bundles have been scanned');
    // }

    const toUpdate = data.filter((row) => row.StyleBulletinID);
    const toCreate = data.filter((row) => !row.StyleBulletinID);

    const bulletinIds = toUpdate.map((row) => row.StyleBulletinID);
    const deleteQuery = `
      DELETE FROM Essentials.StyleBulletin
      WHERE
        StyleTemplateID = ${VariantID}${bulletinIds.length > 0 ?
        `AND StyleBulletinID NOT IN (${bulletinIds.join(', ')})` :
        ''
      };
    `;
    await addPool.request().query(deleteQuery);

    if (toCreate.length > 0) {
      const query = `
        INSERT INTO Essentials.StyleBulletin (
          StyleTemplateID,
          OperationID,
          OperationSequence,
          ScanType,
          IsFirst,
          IsLast,
          MachineTypeID,
          SMV,
          PieceRate,
          IsCritical )
        VALUES ${toCreate.map((row) => `(
          ${VariantID},
          ${row.OperationID},
          ${row.OperationSequence},
          '${row.ScanType}',
          ${row.IsFirst ? 1 : 0},
          ${row.IsLast ? 1 : 0},
          ${row.MachineTypeID},
          ${row.SMV ? row.SMV : null},
          ${row.PieceRate ? row.PieceRate : null},
          ${row.IsCritical ? 1 : 0})
        `).join(', ')};
      `;
      await addPool.request().query(query);
    }

    for (const row of toUpdate) {
      const query = `
        UPDATE Essentials.StyleBulletin
        SET
          StyleTemplateID = ${VariantID},
          OperationID = ${row.OperationID},
          OperationSequence = ${row.OperationSequence},
          ScanType = '${row.ScanType}',
          IsFirst = ${row.IsFirst ? 1 : 0},
          IsLast = ${row.IsLast ? 1 : 0},
          MachineTypeID = ${row.MachineTypeID},
          SMV = ${row.SMV ?? null},
          PieceRate = ${row.PieceRate ?? null}
        WHERE StyleBulletinID = ${row.StyleBulletinID}
      `;
      await addPool.request().query(query);
    }

    const returnData = {
      created: toCreate,
      updated: toUpdate,
    };
    const message = errorHandler(returnData);
    return message;
    
  } catch (error) { 
    return reply.internalServerError(error.message.toString());
  }
};

const deleteOneStyleTemplate = async (request, reply) => {
  const StyleTemplateID = request.params.StyleTemplateID;
  try {
    const styleTemplate = await readPool.request()
      .query(`SELECT [StyleTemplateID]
    ,[StyleTemplateCode]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[StyleTemplate] WHERE StyleTemplateID = ${StyleTemplateID}`);
    if (styleTemplate.recordset.length == 0) {
      reply.notFound("StyleTemplate Does Not Exist!");
    }
    const productionOrderExists = await readPool.request()
      .query(`SELECT [StyleTemplateID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[ProductionOrder] WHERE StyleTemplateID = ${StyleTemplateID}`);
    if (productionOrderExists.recordset.length == 0) {
      reply.badRequest(
        "Operation Failed! StyleTemplate Exists In ProductionOrder!"
      );
    }
    const styleBulletinExists = await readPool.request()
      .query(`SELECT [StyleTemplateID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[StyleBulletin] WHERE StyleTemplateID = ${StyleTemplateID}`);
    if (styleBulletinExists.recordset.length == 0) {
      reply.badRequest(
        "Operation Failed! StyleTemplate Exists In StyleBulletin!"
      );
    }
    const pieceWiseCutReportExists = await readPool.request()
      .query(`SELECT [StyleTemplateID]
    ,[CreatedAt]
    ,[UpdatedAt]
FROM [Essentials].[PieceWiseCutReport] WHERE StyleTemplateID = ${StyleTemplateID}`);
    if (pieceWiseCutReportExists.recordset.length == 0) {
      reply.badRequest(
        "Operation Failed! StyleTemplate Exists In PieceWiseCutReport!"
      );
    } else {
      const deletedStyleTemplate = await addPool.request()
        .query(`DELETE FROM [Essentials].[StyleTemplate]
    WHERE StyleTemplateID = ${StyleTemplateID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

module.exports = {
  findStyleTemplateByID,
  findAllStyleTemplates,
  findAvailableStyleTemplates,
  findVariationsForParentStyleTemplate,
  findAvailableParentStyleTemplates,
  insertOneStyleTemplate,
  insertWithVariant,
  deleteOneStyleTemplate,
  findAllParentStyleTemplates,
  updateVariant
};
