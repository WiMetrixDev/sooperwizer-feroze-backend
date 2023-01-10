"use strict";

const getErrorMessage = require("../../utils/getErrorMessage.js");
const errors = require("../../validations/error-handler.js");
const errorHandler = errors.errorHandler;

const get = async function (request, reply) {
  const StyleBulletinID = request.params.StyleBulletinID;
  try {
    const data = await readPool
      .request()
      .query(
        `select * from [Essentials].StyleBulletin where StyleBulletinID = ${StyleBulletinID}`
      );
    if (data.recordset.length != 0) {
      const message = errorHandler(data.recordset[0]);
      return message;
    } else {
      return reply.notFound("StyleBulletin Does Not Exist!");
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const findByStyleTemplateID = async function (request, reply) {
  const StyleTemplateID = parseInt(request.params.StyleTemplateID);
  try {
    const data = await readPool.request().query(
      `      select sb.*,mt.MachineTypeCode,op.OperationCode,op.OperationDescription,s.*
            from [Essentials].StyleBulletin as sb 
            join [Essentials].MachineType as mt on sb.MachineTypeID = mt.MachineTypeID 
            join Essentials.Operation as op on sb.OperationID = op.OperationID
            join Essentials.[Section] as s on s.SectionID  = op.SectionID  where StyleTemplateID = ${StyleTemplateID}`
    );

    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    const errorStr = error.toString();
    reply.internalServerError(errorStr);
  }
};

const getAll = async (request, reply) => {
  try {
    const data = await readPool
      .request()
      .query(`select * from [Essentials].StyleBulletin `);
    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

/* Inserts One Or Many Operaion Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/
const insertOneStyleBulletin = async function (request, reply) {
  const {
    StyleTemplateID,
    OperationID,
    OperationSequence,
    ScanType,
    IsFirst,
    IsLast,
    MachineTypeID,
  } = request.body;
  try {
    await addPool.request().query(`INSERT INTO [Essentials].[StyleBulletin]
    ([StyleTemplateID]
    ,[OperationID]
    ,[OperationSequence]
    ,[ScanType]
    ,[IsFirst]
    ,[IsLast]
    ,[MachineTypeID])
VALUES
    (${StyleTemplateID}
    ,${OperationID}
    ,${OperationSequence}
    ,'${ScanType}'
    ,${IsFirst}
    ,${IsLast}
    ,${MachineTypeID}`);
    const message = errorHandler();
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const insertManyStyleBulletins = async function (request, reply) {
  try {
    const data = {
      successful: [],
      failed: [],
    };
    await Promise.all(
      request.body.map(async (row) => {
        try {
          await addPool.request()
            .query(`INSERT INTO [Essentials].[StyleBulletin]
        ([StyleTemplateID]
        ,[OperationID]
        ,[OperationSequence]
        ,[ScanType]
        ,[IsFirst]
        ,[IsLast]
        ,[MachineTypeID])
    VALUES
        (${row.StyleTemplateID}
        ,${row.OperationID}
        ,${row.OperationSequence}
        ,'${row.ScanType}'
        ,${row.IsFirst}
        ,${row.IsLast}
        ,${row.MachineTypeID}`);
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
    const message = errorHandler(data);
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const updateOneStyleBulletin = async (request, reply) => {
  const currentDate = new Date();
  const {
    StyleBulletinID,
    StyleTemplateID,
    OperationID,
    OperationSequence,
    IsFirst,
    IsLast,
    MachineTypeID,
  } = request.body;
  try {
    const styleBulletin = await readPool
      .request()
      .query(
        `select * from [Essentials].StyleBulletin where StyleBulletinID = ${StyleBulletinID}`
      );
    if (styleBulletin.recordset.length == 0) {
      reply.notFound("StyleBulletin Does Not Exist!");
    }
    const machineTypeExists = await readPool
      .request()
      .query(
        `select * from [Essentials].MachineType where MachineTypeID = ${MachineTypeID}`
      );
    if (machineTypeExists.recordset.length == 0) {
      reply.notFound("Operation Failed! MachineType Does Not Exist!");
    }
    const operationExists = await readPool
      .request()
      .query(
        `select * from [Essentials].Operation where OperationID = ${OperationID}`
      );
    if (operationExists.recordset.length == 0) {
      reply.notFound("Operation Failed! Operation Does Not Exist!");
    }
    const styleTemplateExists = await readPool
      .request()
      .query(
        `select * from [Essentials].StyleTemplate where StyleTemplateID = ${StyleTemplateID}`
      );
    if (styleTemplateExists.recordset.length == 0) {
      reply.notFound("Operation Failed! StyleTemplate Does Not Exist!");
    } else {
      await addPool.request().query(`UPDATE [Essentials].[StyleBulletin]
      SET [StyleTemplateID] = ${StyleTemplateID}
         ,[OperationID] = ${OperationID}
         ,[OperationSequence] = ${OperationSequence}
         ,[IsFirst] = ${IsFirst}
         ,[IsLast] = ${IsLast}
         ,[MachineTypeID] = ${MachineTypeID}
         ,[PieceRate] = ${data.PieceRate}
         ,[SMV] = ${data.SMV}
         ,[UpdatedAt] = getDate()
    WHERE StyleBulletinID = ${StyleBulletinID}`);
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};
//Object.entries({a: 1, b: 2}).map(([key, value]) => `${key} = ${value}`).join(', ')
const updateByStyleTemplateID = async (request, reply) => {
  const currentDate = new Date();
  try {
    if (isNaN(request.params.StyleTemplateID)) {
      reply.badRequest("Style Template Not Valid! Must Be A Number");
    }
    const StyleTemplateID = parseInt(request.params.StyleTemplateID);
    const { toAdd, toUpdate, toDelete } = request.body;

    const existingStyleTemplate = await readPool
      .request()
      .query(
        `select StyleTemplateID from [Essentials].StyleTemplate where StyleTemplateID = ${StyleTemplateID}`
      );
    if (existingStyleTemplate.recordset.length == 0) {
      return reply.badRequest("Style Template Does Not Exists!");
    }
    const transactionArray = [];
    if (toAdd?.length > 0) {
      for (item in toAdd) {
        const insertMany = await addPool.request()
          .query(`INSERT INTO [Essentials].[StyleTemplate]
        ([StyleTemplateCode])
  VALUES
        (${item.StyleTemplateCode})`);
        transactionArray.push(insertMany);
      }
    }
    if (toUpdate?.length > 0) {
      toUpdate.forEach(async ({ StyleBulletinID, ...data }) => {
        const updateOne = await addPool.request()
          .query(`UPDATE [Essentials].[StyleBulletin]
          SET [StyleTemplateID] = ${StyleTemplateID}
             ,[OperationID] = ${data.OperationID}
             ,[OperationSequence] = ${data.OperationSequence}
             ,[IsFirst] = ${data.IsFirst ? 1 : 0}
             ,[IsLast] = ${data.IsLast ? 1 : 0}
             ,[MachineTypeID] = ${data.MachineTypeID}
             ,[PieceRate] = ${data.PieceRate}
             ,[SMV] = ${data.SMV}
             ,[UpdatedAt] = getDate()
        WHERE StyleBulletinID = ${StyleBulletinID}`);
        transactionArray.push(updateOne);
      });
    }
    if (toDelete?.length > 0) {
      const toDeleteIDs = toDelete.map((row) => row.StyleBulletinID);
      const deleteMany = await addPool
        .request()
        .query(
          `delete from [Essentials].[StyleBulletin] where StyleBulletinID in (${toDeleteIDs.toString()})`
        );
      transactionArray.push(deleteMany);
    }

    if (!toAdd?.length > 0 && !toUpdate?.length > 0 && toDelete?.length > 0) {
      // const hasStyleBulletin = await prisma.style_bulletin.findFirst({
      //   where: {
      //     StyleTemplateID,
      //   },
      // });
      const hasStyleBulletin = await readPool
        .request()
        .query(
          `select * from [Essentials].[StyleBulletin] where StyleTemplateID = ${StyleTemplateID}`
        );
      // const hasPo = await prisma.production_order.findFirst({
      //   where: {
      //     StyleTemplateID,
      //   },
      // });
      const hasPo = await readPool
        .request()
        .query(
          `select * from [Essentials].[ProductionOrder] where StyleTemplateID = ${StyleTemplateID}`
        );
      if (
        hasStyleBulletin.recordset.length == 0 &&
        hasPo.recordset.length == 0
      ) {
        // await prisma.style_template.delete({
        //   where: {
        //     StyleTemplateID,
        //   },
        // });
        await addPool
          .request()
          .query(
            `delete from Essentials.StyleTemplate where StyleTemplateId = ${StyleTemplateID}`
          );
      }
    }
    const message = errorHandler();
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const deleteOneStyleBulletin = async (request, reply) => {
  const StyleBulletinID = request.params.StyleBulletinID;
  try {
    const styleBulletin = await readPool
      .request()
      .query(
        `select * from [Essentials].StyleBulletin where StyleBulletinID = ${StyleBulletinID}`
      );
    if (styleBulletin.recordset.length == 0) {
      reply.notFound("StyleBulletin Does Not Exist!");
    } else {
      await request().query(
        `delete from [Essentials].StyleBulletin where StyleBulletinID = ${StyleBulletinID}`
      );
      const message = errorHandler();
      return message;
    }
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

const assignStyleBulletin = async (request, reply) => {
  try {
    const {
      ParentStyleTemplateID,
      ProductionOrderID,
      VariantID,
      FollowsOperationSequence,
    } = request.body;
    const CutIDs = Array.isArray(request.body.CutIDs)
      ? request.body.CutIDs
      : null;
    const BundleIDs = Array.isArray(request.body.BundleIDs)
      ? request.body.BundleIDs
      : null;
    let existsInScanning;

    await addPool.request().query(`UPDATE [Essentials].[ProductionOrder]
    SET 
       [StyleTemplateID] = ${ParentStyleTemplateID}
       ,[IsFollowOperationSequence] = ${FollowsOperationSequence ? 1 : 0}
       ,[UpdatedAt] = getdate()
  WHERE ProductionOrderID = ${ProductionOrderID}`);

    const assigned = [];
    const failed = [];
    const idArray = CutIDs ?? BundleIDs ?? [];

    for (const id of idArray) {
      if (CutIDs) {
        existsInScanning = await readPool.request()
          .query(`select ScanID from Data.PieceWiseScan 
            where BundleID in (select BundleID  from Essentials.CutReport where CutJobID = ${id})`);
      } 
      else if (BundleIDs) {
        existsInScanning = await readPool
          .request()
          .query(
            `select ScanID from Data.PieceWiseScan where BundleID =  ${parseInt(
              id
            )}`
          );
      }

      if (existsInScanning.recordset.length != 0) {
        failed.push(id);
        continue;
      }
      if (CutIDs) {
        await addPool.request().query(`UPDATE [Essentials].[PieceWiseCutReport]
      SET 
         [UpdatedAt] = getDate()
         ,[StyleTemplateID] = ${VariantID}
    WHERE BundleID in (select BundleID  from Essentials.CutReport where CutJobID = ${id})`);

    await addPool.request().query(`UPDATE [Essentials].[CutReport]
      SET 
         [UpdatedAt] = getDate()
         ,[StyleTemplateID] = ${VariantID}
    WHERE BundleID in (select BundleID  from Essentials.CutReport where CutJobID = ${id})`);

    await addPool.request().query(`UPDATE [Essentials].[CutJob]
      SET 
         [UpdatedAt] = getDate()
         ,[StyleTemplateID] = ${VariantID}
    WHERE CutJobID = ${id}`);

      } else if (BundleIDs) {
        await addPool.request().query(`UPDATE [Essentials].[PieceWiseCutReport]
      SET 
         [UpdatedAt] = getDate()
         ,[StyleTemplateID] = ${VariantID}
    WHERE BundleID = ${parseInt(id)}`);
      }

      assigned.push(id);
    }

    if (assigned.length === 0 && failed.length > 0) {
      throw new Error(
        "Assignment Not Possible! All Records Have Been Scanned."
      );
    }
    let data = { assigned, failed };

    const message = errorHandler(data);
    return message;
  } catch (err) {
    const errorStr = err.toString();
    return reply.internalServerError(errorStr);
  }
};
module.exports = {
  get,
  findByStyleTemplateID,
  getAll,
  insertOneStyleBulletin,
  insertManyStyleBulletins,
  updateOneStyleBulletin,
  updateByStyleTemplateID,
  deleteOneStyleBulletin,
  assignStyleBulletin,
};
