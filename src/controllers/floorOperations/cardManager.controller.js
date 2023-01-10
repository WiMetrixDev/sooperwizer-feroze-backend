"use strict";

const getErrorMessage = require("../../utils/getErrorMessage.js");
const errors = require("../../validations/error-handler.js");
const cutJobController = require("../spts/cutJob.controller.js");
const errorHandler = errors.errorHandler;

module.exports = {
  getData: async (request, reply) => {
    const cardType = request.params.cardType;
    let data;
    if (cardType) {
      try {
        switch (cardType) {
          case "5":
            data = await readPool
              .request()
              .query(`select * from [Essentials].Worker`);
            break;
          case "6":
            data = await readPool
              .request()
              .query(`select * from [Essentials].Operation`);
            break;
          case "8":
            data = await readPool
              .request()
              .query(`select * from [Essentials].Machine`);
            break;
          case "10":
            data = await readPool
              .request()
              .query(`select * from [Essentials].Line`);
            break;
          default:
            reply.notFound("Card Type Doesnt Exists!");
        }
        const message = errorHandler(data.recordset);
        return message;
      } catch (error) {
        const errorStr = error.toString();
        reply.internalServerError(errorStr);
      }
    } else {
      reply.badRequest("Insufficient or invalid Parameters");
    }
  },
  getAllInfoForTagID: async (request, reply) => {
    const tagID = request.params.tagID;
    let data;
    try {
      let getTag = await readPool
        .request()
        .query(
          `select * from [Essentials].Tag as t join [Essentials].CutReport as c on t.BundleID = c.BundleID where TagID = ${tagID}`
        );
      if (getTag.recordset.length == 0) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(data.recordset[0]);
        return message;
      }
      let getCut = await readPool
        .request()
        .query(
          `select * from [Essentials].CutJob as c join [Essentials].ProductionOrder as p on c.ProductionOrderID = p.ProductionOrderID  where CutJobID = ${getTag.CutJobID}`
        );
      if (getCut.recordset.length == 0) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(data.recordset[0]);
        return message;
      }
      let getPO = await readPool
        .request()
        .query(
          `select * from [Essentials].ProductionOrder where ProductionOrderID = ${getCut.ProductionOrderID}`
        );
      if (getPO.recordset.length == 0) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(data.recordset[0]);
        return message;
      }

      data = {
        ...getTag,
        ...getCut,
        ...getPO,
      };

      if (!data) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(data);
        return message;
      }
      const message = errorHandler(data);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  getDataForCard: async (request, reply) => {
    const cardType = request.params.cardType;
    const cardNumber = request.params.cardNumber;
    let data;
    if (cardType) {
      try {
        switch (cardType) {
          case "5":
            data = await readPool
              .request()
              .query(
                `select * from [Essentials].Worker where WorkerID = ${cardNumber}`
              );
            break;
          case "6":
            data = await readPool
              .request()
              .query(
                `select * from [Essentials].Operation where OperationID = ${cardNumber}`
              );
            break;
          case "8":
            data = await readPool
              .request()
              .query(
                `select * from [Essentials].Machine MachineID = ${cardNumber}`
              );
            break;
          case "10":
            data = await readPool
              .request()
              .query(`select * from [Essentials].Line LineID = ${cardNumber}`);
            break;
          default:
            reply.notFound("Card Type Doesnt Exists!");
        }
        if (!data) {
          reply.notFound("No information found against Card!");
        }
        const message = errorHandler(data.recordset[0]);
        return message;
      } catch (error) {
        const errorStr = error.toString();
        reply.internalServerError(errorStr);
      }
    } else {
      reply.badRequest("Insufficient or invalid Parameters");
    }
  },
  assignTagToBundle: async (request, reply) => {
    const TagID = parseInt(request.body.TagID);
    const BundleID = parseInt(request.body.BundleID);
    const ForceWrite = request.body.ForceWrite;
    let update;
    let message;
    try {
      const data = await readPool
        .request()
        .query(`select * from [Essentials].Tag where TagID = ${tagID}`);
      if (data.recordset.length == 0) {
        await addPool.request().query(`INSERT INTO [Essentials].[Tag]
              ([BundleID]
              ,[TagID])
        VALUES
              (${BundleID}
                ,${TagID})`);

        message = errorHandler(data.recordset[0]);
        return message;
      } else {
        if (ForceWrite === "true") {
          update = await addPool.request().query(`UPDATE [Essentials].[Tag]
          SET [BundleID] = ${BundleID}
        WHERE TagID = ${TagID}`);
          message = errorHandler(data.recordset[0]);
          return message;
        } else {
          reply.badRequest("Tag Already assigned to Bundle");
        }
      }
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  getPiecesForBundleID: async (request, reply) => {
    const BundleID = request.params.BundleID;
    try {
      const data = await readPool
        .request()
        .query(
          `select * from [Essentials].PieceWiseCutReport where BundleID = ${BundleID}`
        );
      if (data.recordset.length > 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("Data Does Not Exist!");
      }
    } catch (error) {
      reply.internalServerError(error.message.toString());
    }
  },
  getPieces: async (request, reply) => {
    const { filter, ID } = request.body;
    let idArray = [];
    try {
      if (filter === "BU") {
        const data = await readPool
          .request()
          .query(
            `select * from [Essentials].PieceWiseCutReport where BundleID = ${ID}`
          );
        const message = errorHandler(data.recordset);
        return message;
      } else if (filter === "CUT") {
        const cutReport = await readPool
          .request()
          .query(`select * from [Essentials].CutReport where CutJobID = ${ID}`);
        cutReport.recordset.forEach((item) => {
          idArray.push(item.BundleID);
        });

        const data = await readPool
          .request()
          .query(
            `SELECT * FROM piece_wise_cut_report WHERE BundleID in (${idArray.toString()})`
          );
        const message = errorHandler(data.recordset);
        return message;
      } else if (filter === "PO") {
        const cutJob = await readPool
          .request()
          .query(
            `select * from [Essentials].CutJob where ProductionOrderID = ${ID}`
          );
        cutJob.recordset.forEach((item, i) => {
          idArray.push(item.CutJobID);
        });
        const cutReport = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].CutReport WHERE CutJobID in (${idArray.toString()})`
          );
        idArray = [];
        cutReport.recordset.forEach((item, i) => {
          idArray.push(item.BundleID);
        });
        const data = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].PieceWiseCutReport WHERE BundleID in (${idArray.toString()})`
          );
        const message = errorHandler(data.recordset);
        return message;
      } else if (filter === "SO") {
        const saleOrder = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].CutReport WHERE CutJobID in (${idArray.toString()})`
          );
        saleOrder.recordset.forEach((item, i) => {
          idArray.push(item.ProductionOrderID);
        });
        const cutJob = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].CutJob WHERE ProductionOrderID in (${idArray.toString()})`
          );
        idArray = [];
        cutJob.recordset.forEach((item, i) => {
          idArray.push(item.CutJobID);
        });
        const cutReport = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].CutReport WHERE CutJobID in (${idArray.toString()})`
          );
        idArray = [];
        cutReport.recordset.forEach((item, i) => {
          idArray.push(item.BundleID);
        });
        const data = await readPool
          .request()
          .query(
            `SELECT * FROM [Essentials].PieceWiseCutReport WHERE BundleID in (${idArray.toString()})`
          );
        const message = errorHandler(data.recordset);
        return message;
      }
    } catch (error) {}
  },
  insertPieces: async (request, reply) => {
    const list = request.body.list;
    let filter;
    let array = [];
    let getPieces = [];
    let insert;
    let selectedPieces = [];

    let scangroup = await addPool.request()
      .query(`INSERT INTO [Essentials].[ScanGroup]
    ([CreatedAt]) OUTPUT INSERTED.[GroupID] VALUES (getdate())`);
    let query = "";
    try {
      for (let i = 0; i < list.length; i++) {
        filter = request.body.list[i].filter;
        array = JSON.parse(request.body.list[i].array);

        if (filter == "SO") {
          getPieces = await readPool.request()
            .query(`select pwc.PieceID from Essentials.PieceWiseCutReport as pwc join Essentials.CutReport as cr on pwc.BundleID = cr.BundleID
          join Essentials.CutJob as cj on cj.CutJobID = cr.CutJobID join Essentials.ProductionOrder as po on po.ProductionOrderID = cj.ProductionOrderID
          join Essentials.SaleOrder as so on so.SaleOrderID = po.SaleOrderID where so.SaleOrderID in (${array.toString()})`);

          getPieces.recordset.forEach((item) => {
            if (
              selectedPieces.every((piece) => piece.PieceID !== item.PieceID)
            ) {
              selectedPieces.push(item);
            }
          });
        }
        if (filter == "PO") {
          getPieces = await readPool.request()
            .query(`select pwc.PieceID from Essentials.PieceWiseCutReport as pwc join Essentials.CutReport as cr on pwc.BundleID = cr.BundleID
        join Essentials.CutJob as cj on cj.CutJobID = cr.CutJobID join Essentials.ProductionOrder as po on po.ProductionOrderID = cj.ProductionOrderID
        where po.ProductionOrderID in (${array.toString()})`);
          getPieces.recordset.forEach((item) => {
            if (
              selectedPieces.every((piece) => piece.PieceID !== item.PieceID)
            ) {
              selectedPieces.push(item);
            }
          });
        }
        if (filter == "CUT") {
          getPieces = await readPool.request()
            .query(`select pwc.PieceID from Essentials.PieceWiseCutReport as pwc join Essentials.CutReport as cr on pwc.BundleID = cr.BundleID
      join Essentials.CutJob as cj on cj.CutJobID = cr.CutJobID where cj.CutJobID in (${array.toString()})`);
          getPieces.recordset.forEach((item) => {
            if (
              selectedPieces.every((piece) => piece.PieceID !== item.PieceID)
            ) {
              selectedPieces.push(item);
            }
          });
        }
        if (filter == "BU") {
          getPieces = await readPool
            .request()
            .query(
              `select pwc.PieceID from Essentials.PieceWiseCutReport as pwc join Essentials.CutReport as cr on pwc.BundleID = cr.BundleID where cr.BundleID in (${array.toString()})`
            );
          getPieces.recordset.forEach((item) => {
            if (
              selectedPieces.every((piece) => piece.PieceID !== item.PieceID)
            ) {
              selectedPieces.push(item);
            }
          });
        }
        if (filter == "PI") {
          getPieces = await readPool
            .request()
            .query(
              `select PieceID from Essentials.PieceWiseCutReport where PieceID in (${array.toString()})`
            );
          getPieces.recordset.forEach((item) => {
            if (
              selectedPieces.every((piece) => piece.PieceID !== item.PieceID)
            ) {
              selectedPieces.push(item);
            }
          });
        }
      }
      let wasAdded = selectedPieces.length > 0;

      for (const item of selectedPieces) {
        try {
          let findBundleID = await readPool
            .request()
            .query(
              `select * from Essentials.PieceWiseCutReport where PieceID = (${item.PieceID})`
            );
          query =
            query +
            `\n` +
            `INSERT INTO [Essentials].[PieceWiseGroup]
            ([GroupID]
            ,[BundleID]
            ,[PieceID])
            OUTPUT INSERTED.[GroupID]
            VALUES
            (${parseInt(scangroup.recordset[0].GroupID)}
            ,${findBundleID.recordset[0].BundleID}
            ,${parseInt(item.PieceID)});`;
        } catch (err) {
          wasAdded = false;
        }
      }
      try {
        insert = await addPool.request().query(query);
      } catch (err) {
        wasAdded = false;
      }

      let obj = {};
      if (wasAdded) {
        obj = {
          statusCode: 200,
          error: "Success!",
          message: "Operation Successful!",
          GroupID: insert.recordset[0].GroupID,
        };
      } else {
        obj = {
          statusCode: 200,
          error: "Failed! no pieces found",
          message: "Operation Unsuccessful!",
          GroupID: null,
        };
      }

      reply.send(obj);
    } catch (error) {}
  },
  returnPieces: async (request, reply) => {
    const TagID = parseInt(request.params.TagID);
    try {
      const group = await readPool
        .request()
        .query(`select * from [Essentials].Tag where TagID = ${TagID}`);

      if (group.recordset.length == 0) {
        return reply.notFound("Tag Does Not Exist!");
      }

      let data = await readPool.request().query(
        `select distinct pwcr.PieceID,pwcr.BundleID,pwcr.PieceNumber,cr.BundleCode,
        cj.CutNo,po.ProductionOrderCode,so.SaleOrderCode  
        from Essentials.PieceWiseGroup as pwg 
          join Essentials.PieceWiseCutReport as pwcr on pwg.PieceID = pwcr.PieceID
          join Essentials.CutReport as cr on pwcr.BundleID = cr.BundleID
          join Essentials.CutJob cj on cj.CutJobID  = cr.CutJobID 
          join Essentials.ProductionOrder po on po.ProductionOrderID  = cj.ProductionOrderID 
          join Essentials.SaleOrder so on so.SaleOrderID = po.SaleOrderID  where pwg.GroupID =${group.recordset[0].GroupID}`
      );

      data = data.recordset;
      const message = errorHandler(data);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(error);
    }
  },
  returnPieceScanning: async (request, reply) => {
    const TagID = parseInt(request.params.TagID);
    try {
      const data = await readPool
        .request()
        .query(
          ` SELECT * FROM Essentials.PieceWiseScan where GroupID in (select GroupID from tag where TagID = ${TagID})`
        );
      if (!data) {
        reply.notFound("Data Not Found!");
      } else {
        const message = errorHandler(data.recordset);
        return message;
      }
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(error);
    }
  },
  assignTagToGroup: async (request, reply) => {
    const TagID = parseInt(request.body.TagID);
    const GroupID = parseInt(request.body.GroupID);
    const ForceWrite = request.body.ForceWrite;
    let updateTagInfo;

    let message;
    try {
      const data = await readPool
        .request()
        .query(`select * from [Essentials].Tag where TagID = ${TagID}`);

      const groupExists = await readPool
        .request()
        .query(
          `select * from [Essentials].PieceWiseGroup where GroupID = ${GroupID}`
        );
      if (groupExists.recordset.length == 0) {
        return reply.notFound("Group Does Not Exist!");
      }

      if (data.recordset.length === 0) {
        let insertTag = await addPool.request()
          .query(`INSERT INTO [Essentials].[Tag]
         ([TagID]
         ,[GroupID])
          VALUES
        (${TagID}
          ,${GroupID})`);
        message = errorHandler(data.recordset);
        return message;
      } else if (
        data.recordset.length != 0 &&
        groupExists.recordset.length != 0
      ) {
        if (ForceWrite === "true") {
          let getBundle = await readPool.request().query(
            `select * from [Essentials].CutReport as cr
              join Essentials.CutJob as cj on cr.CutJobID = cj.CutJobID 
              where cr.BundleID = ${groupExists.recordset[0].BundleID}`
          );

          let getPO = await readPool
            .request()
            .query(
              `select * from [Essentials].ProductionOrder where ProductionOrderID = ${getBundle.recordset[0].ProductionOrderID}`
            );

          updateTagInfo = await addPool.request()
            .query(`UPDATE [Essentials].[Tag]
          SET [GroupID] = ${GroupID}
          WHERE TagID = ${TagID}`);

          // let updatePieceInfo = await addPool
          //   .request()
          //   .query(
          //     `update Essentials.PieceWiseCutReport set StyleTemplateID=${getPO.recordset[0].StyleTemplateID} where PieceID in (select PieceID from Essentials.PieceWiseGroup where GroupID=${GroupID})`
          //   );

          message = errorHandler(updateTagInfo);

          return message;
        } else {
          return reply.badRequest("Tag Already assigned to Bundle!");
        }
      }
    } catch (error) {
      const errorStr = error.toString();
      return reply.badRequest(errorStr);
    }
  },
  getScanningDetailsForTagID: async (request, reply) => {
    const TagID = request.params.TagID;
    let data;
    try {
      let getTag = await readPool
        .request()
        .query(`select * from Essentials.Tag where TagID ='${TagID}'`);

      if (!getTag.recordset.length > 0) {
        reply.notFound("Information aginst Tag not found");
        const message = errorHandler(scanningData);
        return message;
      }

      let scanningData = await readPool.request().query(`
          --select CutNo,PieceNumber,BundleCode,CreatedAt,OrID,ProductionOrderCode as PO,OpSeq as OperationSequence,
			    --DepartmentID,OperationDescription,DepartmentName,LineCode,WorkerCode,MachineCode
          select *
				  from Data.PieceWiseScan where PieceID in 
          (select PieceID from Essentials.PieceWiseGroup where GroupID = ${getTag.recordset[0].GroupID})
          order by CreatedAt desc
      `);

      if (!scanningData.recordset.length > 0) {
        reply.notFound("No Scannings found for this tag");
        const message = errorHandler(scanningData);
        return message;
      }

      query = `select pwcr.PieceNumber,cr.BundleCode,cj.CutNo,po.ProductionOrderCode ,so.SaleOrderCode
      from Essentials.PieceWiseCutReport as pwcr
      join Essentials.CutReport cr on pwcr.BundleID = cr.BundleID
      join Essentials.CutJob cj on cr.CutJobID = cj.CutJobID 
      join Essentials.ProductionOrder po on po.ProductionOrderID = cj.ProductionOrderID  
      join Essentials.SaleOrder so on so.SaleOrderID  = po.SaleOrderID 
      where cr.BundleID = '${getPieceInfo.recordset[0].BundleID}'`;
      const getInfoForPiece = await readPool.request().query(query);

      if (getInfoForPiece.recordset.length == 0) {
        const message = errorHandler2(
          "Bundle/Piece not found!",
          "Bundle/Piece not found!"
        );
        return message;
      }
      let obj = {
        ...scanningData.recordset,
        ...getInfoForPiece
      };
      const message = errorHandler(obj);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
};
