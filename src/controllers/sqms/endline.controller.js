'use strict';
const errors = require('../../validations/error-handler');

const errorHandler = errors.errorHandler;

const getErrorMessage = require('../../utils/getErrorMessage');
module.exports = {
  getBundlesForCutJobID: async (request, reply) => {
    const { CutJobID, SectionID } = request.body;
    try {
      let getBundles = await readPool
        .request()
        .query(
          `select * from Essentials.CutReport where CutJobID = ${CutJobID}`,
        );
      if (getBundles.recordset.length == 0) {
        const obj = {
          statusCode: 200,
          error: 'No info found!',
          message: 'No pieces found for given Tag!',
          //    FollowUp: getRound.recordset[0].FollowUp,
        };
        return obj;
      }
      getBundles = getBundles.recordset;
      // console.log(getBundles);
      // let getPieces;
      // let response = [];
      // await Promise.all(
      //   await getBundles.map(async (bundle) => {
      //     getPieces = await readPool.request().query(
      //       `select pwc.*, isNull(es.Status,0) as status,isNull(es.EndLineSessionID,-1) as EndLineSessionID
      //     FROM Essentials.PieceWiseCutReport as pwc left join Data.EndLineSession as es
      //     on pwc.PieceID= es.PieceID where pwc.BundleID = ${bundle.BundleID} and es.SectionID = ${SectionID}`
      //     );
      //     response.push({ Bundle: { ...bundle, Pieces: getPieces.recordset } });
      //   })
      // );

      return errorHandler(getBundles);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getInfoForTagID: async (request, reply) => {
    const { TagID, SectionID, LineID } = request.body;
    // console.log(TagID)
    // console.log(request.body);
    try {
      let getGroup = await readPool
        .request()
        .query(`select * from Essentials.Tag where TagID = ${TagID}`);
      getGroup = getGroup.recordset[0];

      const getPiecesInfo = await readPool.request()
        .query(`select es.Status, pwg.*, isNull(es.Status,0) as status,isNull(es.EndLineSessionID,-1) as EndLineSessionID , pwcr.PieceNumber
        from Essentials.PieceWiseGroup pwg
        join [Essentials].[PieceWiseCutReport] as pwcr on pwg.PieceID = pwcr.PieceID
        left join Data.EndLineSession as es
        on pwg.PieceID= es.PieceID and es.SectionID = ${SectionID} and es.Status < 3
        where pwg.GroupID =${getGroup.GroupID}
        `);
      if (getPiecesInfo.recordset.length == 0) {
        const obj = {
          statusCode: 200,
          error: 'No info found!',
          message: 'No pieces found for given Tag!',
          //    FollowUp: getRound.recordset[0].FollowUp,
        };
        return obj;
      }
      return errorHandler(getPiecesInfo.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getFaultHistoryForPieceID: async (request, reply) => {
    const { PieceID, SectionID } = request.body;
    try {
      const getSections = await readPool.request().query(`SELECT MappedSectionID
        FROM Essentials.SectionMapping Where SectionID = ${SectionID}`);

      const sections = [];
      sections.push(SectionID);
      if (getSections.recordset.length > 0) {
        getSections.recordset.map((section) => {
          sections.push(section.MappedSectionID);
        });
      }
      const getPieces = await readPool.request().query(
        `select efl.FaultID,efl.FaultCount,pwc.*, isNull(es.Status,0) as status,isNull(es.EndLineSessionID,-1) as EndLineSessionID
          FROM Essentials.PieceWiseCutReport as pwc left join Data.EndLineSession as es
          on pwc.PieceID= es.PieceID join Data.EndLineFaultLog as efl on efl.EndLineSessionID = es.EndLineSessionID
		      where pwc.PieceID = ${PieceID} and es.SectionID in (${sections})`,
      );
      if (getPieces.recordset.length == 0) {
        const obj = {
          statusCode: 200,
          error: 'No info found!',
          message: 'No info found!',
          //    FollowUp: getRound.recordset[0].FollowUp,
        };
        return obj;
      }
      return errorHandler(getPieces.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getPiecesForBundleID: async (request, reply) => {
    const { BundleID, SectionID } = request.body;
    // console.log(request.body);
    try {
      let getPieces = await readPool.request().query(
        `select pwc.*, isNull(es.Status,0) as status,isNull(es.EndLineSessionID,-1) as EndLineSessionID
           FROM Essentials.PieceWiseCutReport as pwc left join Data.EndLineSession as es
          on pwc.PieceID = es.PieceID and es.SectionID = ${SectionID} where pwc.BundleID = ${BundleID} `,
      );
      if (getPieces.recordset.length == 0) {
        const obj = {
          statusCode: 200,
          error: 'No info found!',
          message: 'No info found!',
          //    FollowUp: getRound.recordset[0].FollowUp,
        };
        return obj;
      }
      getPieces = getPieces.recordset;

      return errorHandler(getPieces);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getOperationAndWorkersDetailsByPieceID: async (request, reply) => {
    const PieceID = request.body.PieceID;
    const SectionID = request.body.SectionID;
    let getFromScanning;
    try {
      const getSections = await readPool.request().query(`SELECT MappedSectionID
        FROM Essentials.SectionMapping Where SectionID = ${SectionID}`);

      const sections = [];
      sections.push(SectionID);
      if (getSections.recordset.length > 0) {
        getSections.recordset.map((section) => {
          sections.push(section.MappedSectionID);
        });
      }

      const getPieceDetail = await readPool.request().query(`SELECT *
        FROM Essentials.PieceWiseCutReport Where PieceID = ${PieceID}`);

      const q = `select pws.*,o.OperationCode,o.OperationDescription,o.OperationType,
         null as WorkerCode, null as WorkerDescription, null as WorkerID, null as PieceWiseScanningID
        from Essentials.StyleBulletin as pws
        join Essentials.Operation as o on pws.OperationID = o.OperationID
        where pws.StyleTemplateID = ${getPieceDetail.recordset[0].StyleTemplateID}
        and o.SectionID in (${sections})`;
      console.log(q);
      getFromScanning = await readPool.request()
        .query(q);


      if (getFromScanning.length == 0) {
        const obj = {
          statusCode: 200,
          error: 'No info found!',
          message: 'No info found!',
          //    FollowUp: getRound.recordset[0].FollowUp,
        };
        return obj;
      }

      const scannedOperations = getFromScanning.recordset;

      return errorHandler(scannedOperations);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  createEndlineSession: async (request, reply) => {
    const { LineID, SectionID, UserID } = request.body;
    const pieces = request.body.Pieces;
    let query = ``;
    let insertion = -1;
    try {
      await Promise.all(
        await pieces.map(async (piece) => {
          query = `
            Declare @EndlineSessionID INT;
            BEGIN
            IF NOT EXISTS (SELECT * FROM [Data].[EndLineSession]
	          WHERE PieceID = ${piece.PieceID} and SectionID = ${SectionID})
            BEGIN
                INSERT INTO [Data].[EndLineSession]
                        ([LineID]
                        ,[SectionID]
                        ,[BundleID]
                        ,[PieceID]
                        ,[UserID]
                        ,[Status])
                  VALUES
                        (${parseInt(LineID)}
                        ,${parseInt(SectionID)}
                        ,${parseInt(piece.BundleID)}
                        ,${parseInt(piece.PieceID)}
                        ,${parseInt(UserID)}
                        ,${piece.Status})
              END
              ELSE
            BEGIN
              UPDATE [Data].[EndLineSession]
                SET [Status] = ${piece.Status}
                  ,[UpdatedAt] = getDate()
                WHERE PieceID = ${piece.PieceID} and SectionID = ${SectionID}
            END
            Select @EndlineSessionID = EndlineSessionID  from [Data].[EndLineSession]
	          WHERE PieceID = ${piece.PieceID} and SectionID = ${SectionID}
            END
            Select @EndlineSessionID as EndlineSessionID;
            `;
          // console.log("QUERY 1: ", query);
          insertion = await addPool.request().query(query);
          // console.log("INS -> ", insertion);
          query = '';
          await piece.Faults.map((fault) => {
            query =
              query +
              `
                INSERT INTO [Data].[EndLineFaultLog]
                        ([EndLineSessionID]
                        ,[FaultID]
                        ,[FaultCount]
                        ,[PieceWiseScanningID])
                  VALUES
                        (${insertion.recordset[0].EndlineSessionID}
                        ,${parseInt(fault.FaultID)}
                        ,${parseInt(fault.FaultCount)}
                        ,${null});
              `;
          });
          //   console.log("QUERY 2: ", query);
          await addPool.request().query(query);
          query = '';
        }),
      );

      return errorHandler();
    } catch (error) {
      console.log(error);
      return reply.internalServerError(error.toString());
    }
  },
};
