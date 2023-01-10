"use strict";

const { add } = require("nodemon/lib/rules");
const getErrorMessage = require("../../utils/getErrorMessage.js");
const errors = require("../../validations/error-handler.js");
const errorHandler = errors.errorHandler;

module.exports = {
  get: async (request, reply) => {
    const BundleID = request.params.CutReportID;
    try {
      const data = await readPool
        .request()
        .query(
          `select * from [Essentials].[Cutreport] where BundleId = ${BundleID}`
        );
      if (data.recordset.length != 0) {
        const message = errorHandler(data.recordset[0]);
        return message;
      } else {
        return reply.notFound("CutReport Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findCutReportsForCutJobID: async (request, reply) => {
    const CutJobID = request.params.CutJobID;
    try {
      let data = await readPool
        .request()
        .query(
          `	select cr.*,pst.ParentStyleTemplateDescription, st.StyleTemplateCode, cj.CutNo, po.ProductionOrderCode 
          from [Essentials].[Cutreport] as cr
            join Essentials.CutJob as cj on cj.CutJobID = cr.CutJobID
            join Essentials.ProductionOrder as po on po.ProductionOrderID = cj.ProductionOrderID
            left join Essentials.StyleTemplate as st on st.StyleTemplateID =  cr.StyleTemplateID
            left join Essentials.ParentStyleTemplate as pst on pst.ParentStyleTemplateID = po.StyleTemplateID 
          where cr.CutJobID = ${CutJobID}`
        );
      if (data.recordset.length != 0) {
        data = data.recordset.sort(
          (a, b) => parseInt(a.BundleCode) - parseInt(b.BundleCode)
        );
        const message = errorHandler(data);
        return message;
      } else {
        return reply.notFound("CutReport Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Returns All Operaion Records In The Database. If The Operaions' Table Is Empty, Returns Empty Array. */
  getAll: async (request, reply) => {
    try {
      const data = await readPool
        .request()
        .query(`select * from [Essentials].[Cutreport]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },

  addOne: async (request, reply) => {
    const {
      BundleCode,
      BundleQuantity,
      RemainingQuantity,
      Size,
      ScannedQuantity,
    } = request.body;
    let CutJobID = request.body.CutJobID ? request.body.CutJobID : null;
    try {
      if (!CutJobID) {
        let CutJobCode = request.body.CutNo;
        let ProductionOrderID = request.body.ProductionOrderID;
        await addPool.request().query(`
        DELCARE @CutJobID INT;
        BEGIN
        IF NOT EXISTS (Select * from Essentials.CutJob where CutJobCode = '${CutNo}' and ProductionOrderUD = '${ProductionOrderID}')
          BEGIN
          INSERT INTO Essentials.CutJob
          (CutNo, ProductionOrderID)
          VALUES('${CutNo}','${ProductionOrderID}');
          END
        Select @CutJobID =  CutJobID from Essentials.CutJob where CutJobCode = '${CutNo}' and ProductionOrderUD = '${ProductionOrderID}
        INSERT INTO [Essentials].[CutReport]
        ([BundleCode]
        ,[BundleQuantity]
        ,[ScannedQuantity]
        ,[RemainingQuantity]
        ,[Size]
        ,[CutJobID])
        VALUES
      ('${BundleCode}'
      ,${BundleQuantity}
      ,${ScannedQuantity}
      ,${RemainingQuantity}
      ,'${Size}'
      ,@CutJobID)
      
      END
      `);

        const message = errorHandler();
        return message;
      }

      await addPool.request().query(`
      INSERT INTO [Essentials].[CutReport]
      ([BundleCode]
      ,[BundleQuantity]
      ,[ScannedQuantity]
      ,[RemainingQuantity]
      ,[Size]
      ,[CutJobID])
      VALUES
      ('${BundleCode}'
      ,${BundleQuantity}
      ,${ScannedQuantity}
      ,${RemainingQuantity}
      ,'${Size}'
      ,${CutJobID})`);
      const message = errorHandler();
      return message;
    } catch (error) {
      console.log(error);
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Inserts One Or Many Operaion Records In The Database. Takes Into Consideration File Upload ality When Required.*/
  addAll: async (request, reply) => {
    try {
      const data = {
        successful: [],
        failed: [],
      };
      await Promise.all(
        request.body.map(async (row) => {
          try {
            await addPool.request().query(`INSERT INTO [Essentials].[CutReport]
                ([BundleCode]
                ,[BundleQuantity]
                ,[ScannedQuantity]
                ,[RemainingQuantity]
                ,[Size]
                ,[CutJobID])
          VALUES
                ('${row.BundleCode}'
                ,${row.BundleQuantity}
                ,${row.ScannedQuantity}
                ,${row.RemainingQuantity}
                ,'${row.Size}'
                ,${row.CutJobID}`);
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
  },

  addNewBundle: async (request, reply) => {
    const { BundleCode, Quantity, CutNo, ProductionOrderID, MarkerID } =
      request.body;
    try {
      const CutJobExists = await readPool
        .request()
        .query(`SELECT * FROM [Essentials].[CutJob] where CutNo = '${CutNo}'`);
      if (CutJobExists.recordset.length > 0) {
        const CutJobID = CutJobExists.recordset[0].CutJobID;
        const CutJobQuantity = CutJobExists.recordset[0].Plies;

        const CutReportExists = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].[CutReport] where BundleCode = '${BundleCode}'`
          );
        const updatedCutReport = await addPool.request()
          .query(`UPDATE [Essentials].[CutReport]
          SET 
             [BundleQuantity] = BundleQuantity + ${CutJobQuantity}
             ,[UpdatedAt] = getDate()
        WHERE BundleCode = '${BundleCode}'`);

        const message = errorHandler();
        return message;
      } else {
        const RemainingQuantity = 0;
        const insertedCutJob = await addPool.request()
          .query(`INSERT INTO [Essentials].[CutJob]
          ([CutNo]
          ,[ProductionOrderID]
          ,[Plies]
          ,[MarkerID])
          OUTPUT Inserted.CutJobID, Inserted.Plies
          VALUES
          ('${CutNo}'
          ,${ProductionOrderID}
          ,${Quantity}
          ,${MarkerID})`);

        const CutReportExists = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].[CutReport] where BundleCode = '${BundleCode}'`
          );
        const updatedCutReport = await addPool.request()
          .query(`UPDATE [Essentials].[CutReport]
            SET 
               [BundleQuantity] = ${Quantity}
               ,[UpdatedAt] = getDate()
          WHERE BundleCode = '${BundleCode}'`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Edits A Single Operaion Record In The Database. */
  updateOneCutReport: async (request, reply) => {
    const CurrentDate = new Date();
    const BundleID = request.params.BundleID;
    const BundleQuantity = isNaN(request.body.BundleQuantity)
      ? undefined
      : parseInt(request.body.BundleQuantity);
    try {
      const scanExists = await readPool
        .request()
        .query(
          `select * from [Data].[PieceWiseScan] where BundleID = ${BundleID}`
        );
      if (scanExists.recordset.length > 0) {
        reply.badRequest("Operation Failed! Scans Exist For Bundle!");
      } else {
        await addPool.request().query(`UPDATE [Essentials].[CutReport]
         SET 
            [BundleQuantity] = ${BundleQuantity}
            ,[UpdatedAt] = getDate()
       WHERE BundleID = ${BundleID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Deletes A Single Operaion Record From The Database. */
  deleteOneCutReport: async (request, reply) => {
    const BundleID = request.params.BundleID;
    try {
      const cutReportExists = await readPool
        .request()
        .query(
          `select * from [Essentials].[Cutreport] where BundleID = ${BundleID}`
        );
      if (cutReportExists.recordset.length == 0) {
        reply.notFound("CutReport Does Not Exist!");
      }
      const tagExists = await readPool
        .request()
        .query(`select * from [Essentials].[Tag] where BundleID = ${BundleID}`);
      if (tagExists) {
        reply.badRequest("Operation Failed! CutReport Already Exists In Tag!");
      }
      const pieceWiseScanExists = await readPool
        .request()
        .query(
          `select * from [Essentials].[PieceWiseCutreport] where BundleID = ${BundleID}`
        );
      if (pieceWiseScanExists) {
        reply.badRequest(
          "Operation Failed! CutReport Already Exists In PieceWiseScan!"
        );
      }
      const scanExists = await readPool
        .request()
        .query(`select * from [Data].[Scan] where BundleID = ${BundleID}`);
      if (scanExists) {
        reply.badRequest("Operation Failed! Scans Exist For Bundle!");
      } else {
        await addPool.request.query(
          `Delete from [PieceWiseCutreport] where BundleID = ${BundleID}`
        );

        await addPool
          .request()
          .query(`Delete from [CutReport] where BundleID = ${BundleID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  getHistoryForCutJob: async (request, reply) => {
    const CutJobID = parseInt(request.params.CutJobID);
    try {
      const data = await readPool
        .request()
        .query(
          `select * from [Essentials].[Cutreport] where CutJobID = ${CutJobID}`
        );
      if (data.recordset.length != 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("CutReport Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  printBundle: async (request, reply) => {
    try {
      const queryValues = [];
      for (const { BundleID, BundleCode, BundleQuantity } of request.body) {
        let getDetails = await readPool.request().query(`
        select distinct cr.*,po.ProductionOrderCode,so.SaleOrderCode,cj.CutNo,mm.Inseam ,mm.Ratio from Essentials.CutReport cr 
        join Essentials.CutJob cj on cr.CutJobID  = cj.CutJobID 
        join Essentials.ProductionOrder po on po.ProductionOrderID = cj.ProductionOrderID 
        join Essentials.SaleOrder so on so.SaleOrderID = po.SaleOrderID
        left join Essentials.MarkerMapping mm  on mm.MarkerID = cj.MarkerID and cr.[Size]  = mm.[Size]   
          where cr.BundleID = ${BundleID}`);
        // console.log(getDetails)
        if (!getDetails) continue;
        queryValues.push(`(
          '${getDetails.recordset[0].SaleOrderCode}', 
          '${getDetails.recordset[0].ProductionOrderCode}',
          '${getDetails.recordset[0].CutNo}', 
          '${BundleCode}',
          ${BundleQuantity},
          '${getDetails.recordset[0].Size}',
          ${getDetails.recordset[0].Ratio},
          ${getDetails.recordset[0].Inseam}
        )`);
      }
      const query = `
        INSERT INTO Essentials.PrintCutReport (
          SaleOrderCode, 
          ProductionOrderCode, 
          CutNo, 
          BundleCode, 
          BundelQuantity,
          Size,
          Ratio,
          Inseam          
        ) 
        VALUES ${queryValues.join(", ")};
      `;
      //  console.log(query);
      await addPool.request().query(query);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
