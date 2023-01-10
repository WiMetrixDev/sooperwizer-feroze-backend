'use strict';

const getErrorMessage = require('../../utils/getErrorMessage.js');
const errors = require('../../validations/error-handler.js');
const errorHandler = errors.errorHandler;

module.exports = {
  /* Returns A Single Marker Record Based On WorkerID. */
  get: async (request, reply) => {
    const MarkerID = request.params.MarkerID;
    try {
      const data = await readPool
        .request()
        .query(
          `Select * from Essentials.Marker as m join Essentials.ProductionOrder as p on m.ProductionOrderID = p.ProductionOrderID where markerID = ${MarkerID}`,
        );
      if (data) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound('Box Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findMarkerMappingByMarkerID: async (request, reply) => {
    const MarkerID = request.params.MarkerID;
    try {
      const data = await readPool
        .request()
        .query(
          `Select mp.*,m.MarkerCode from [Essentials].[Marker] as m join [Essentials].[MarkerMapping] as mp on m.MarkerID = mp.MarkerID where m.MarkerID = ${MarkerID}`,
        );
      if (!data.recordset.length == 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound('MarkerMapping Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findUniqueSizes: async (request, reply) => {
    try {
      const data = await readPool
        .request()
        .query(
          `select size as Size from Essentials.MarkerMapping group by size`,
        );
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findUniqueInseams: async (request, reply) => {
    let dbData;
    try {
      const data = await readPool
        .request()
        .query(
          `select inseam as Inseam from Essentials.MarkerMapping group by inseam`,
        );
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findByProductionOrderID: async (request, reply) => {
    const ProductionOrderID = request.params.ProductionOrderID;
    try {
      const data = await readPool.request().query(
        `Select m.*,mp.MarkerMappingID,mp.Size,mp.Inseam,mp.Ratio,p.ProductionOrderCode from Essentials.Marker as m
          join Essentials.ProductionOrder as p on m.ProductionOrderID = p.ProductionOrderID
          full outer join Essentials.MarkerMapping as mp on m.MarkerID = mp.MarkerID
          where m.ProductionOrderID = ${ProductionOrderID}`,
      );
      const mappedData = [];
      for (const row of data.recordset) {
        const existingData = mappedData.find(
          (dataRow) => dataRow.MarkerID === row.MarkerID,
        );
        if (existingData) {
          if (!row.MarkerMappingID) continue;
          existingData.MarkerMapping.push({
            Size: row.Size,
            Inseam: row.Inseam,
            Ratio: row.Ratio,
          });
        } else {
          mappedData.push({
            ...row,
            MarkerMapping: row.MarkerMappingID ?
              [{ Size: row.Size, Inseam: row.Inseam, Ratio: row.Ratio }] :
              [],
          });
        }
      }

      const message = errorHandler(mappedData);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findBySaleOrderID: async (request, reply) => {
    const SaleOrderID = request.params.SaleOrderID;
    try {
      const data = await readPool
        .request()
        .query(
          `Select m.* from Essentials.Marker as m join Essentials.ProductionOrder as p on m.ProductionOrderID = p.ProductionOrderID where SaleOrderID = ${SaleOrderID}`,
        );
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Returns All Marker Records In The Database. If The Workers' Table Is Empty, Returns Empty Array. */
  getAll: async (request, reply) => {
    try {
      const data = await readPool
        .request()
        .query(
          `Select * from Essentials.Marker as m join Essentials.ProductionOrder as p on m.ProductionOrderID = p.ProductionOrderID`,
        );
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Inserts One Or Many Marker Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/
  add: async (request, reply) => {
    const { MarkerCode, MarkerMapping, ProductionOrderID } = request.body;
    try {
      const data = {
        successful: [],
        failed: [],
      };

      let marker = await addPool.request().query(`
      Declare @MarkerID INT;
              BEGIN
              IF NOT EXISTS (SELECT * FROM [Essentials].[Marker]
                              WHERE MarkerCode = '${MarkerCode}' and ProductionOrderID =${ProductionOrderID})
              BEGIN
                INSERT INTO [Essentials].[Marker]
                ([MarkerCode]
                ,[ProductionOrderID])
                VALUES
                ('${MarkerCode}'
                ,${ProductionOrderID})
                END
                Select  @MarkerID = MarkerID FROM [Essentials].[Marker]
                WHERE MarkerCode = '${MarkerCode}' and ProductionOrderID =${ProductionOrderID};
            END
            Select @MarkerID as MarkerID
              `);

      if (!marker.recordset[0].MarkerID) {
        return reply.notFound('Marker does not exist');
      }
      marker = marker.recordset[0];
      await Promise.all(
        request.body.MarkerMapping.map(async (row) => {
          try {
            const query = `
            Declare @Error_code INT;
            Declare @Error_Description VARCHAR(20);
            BEGIN
            IF NOT EXISTS (SELECT * FROM [Essentials].[MarkerMapping]
                            WHERE MarkerID = ${marker.MarkerID} and Size ='${row.Size}' and Inseam=${row.Inseam} and Ratio=${row.Ratio})
                BEGIN
                  INSERT INTO [Essentials].[MarkerMapping]
                  ([MarkerID]
                  ,[Size]
                  ,[Ratio]
                  ,[Inseam]
                  )
                  VALUES
                  (${marker.MarkerID}
                  ,'${row.Size}'
                  ,${row.Ratio}
                  ,${row.Inseam}
                  )
                SELECT @Error_code = 0 , @Error_Description='SUCCESSFULL';
                END
                ELSE
                  BEGIN
                    SELECT @Error_code = 1 , @Error_Description='DUPLICATE';
                  END
            Select @Error_code as Error_code , @Error_Description as Error_Description
            END
          `;
            // console.log(query)
            const addMarkerMapping = await addPool.request().query(query);

            if (addMarkerMapping.recordset[0].Error_code === 0) {
              data.successful.push(row);
            } else {
              data.failed.push({
                ...row,
                error: addMarkerMapping.recordset[0].Error_Description,
              });
            }
          } catch (error) {
            console.log(error);
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
      console.log(error);
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Edits A Single Marker Record In The Database. */
  update: async (request, reply) => {
    const CurrentDate = new Date();
    const MarkerID = request.params.MarkerID;
    const { MarkerMapping, ProductionOrderID } = request.body;
    try {
      const marker = await readPool
        .request()
        .query(
          `select * from [Essentials].[Marker] where MarkerID = ${MarkerID}`,
        );
      if (!marker || marker == null || marker.length == 0) {
        reply.notFound('Marker Does Not Exist!');
      }
      const productioNOrderExists = await readPool
        .request()
        .query(
          `select * from [Essentials].[ProductionOrder] where ProductionOrderID = ${ProductionOrderID}`,
        );
      if (
        !productioNOrderExists ||
        productioNOrderExists == null ||
        productioNOrderExists.length == 0
      ) {
        reply.notFound('ProductionOrder Does Not Exist!');
      } else {
        const marker = await addPool.request()
          .query(`UPDATE [Essentials].[Marker]
        SET
           [ProductionOrderID] = ${ProductionOrderID}
           ,[UpdatedAt] = getDate()
      WHERE MarkerID = ${MarkerID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Deletes A Single Marker Record From The Database. */
  delete: async (request, reply) => {
    const MarkerID = request.params.MarkerID;
    try {
      const { recordsets: [markers, cutJobs] } = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[Marker]
        WHERE MarkerID = ${MarkerID};

        SELECT *
        FROM [Essentials].[CutJob]
        WHERE MarkerID = ${MarkerID};
      `);
      if (!markers.length) {
        reply.notFound('Marker Does Not Exist!');
      } else if (cutJobs.recordset) {
        reply.badRequest('Operation Failed! Marker Exists In CutJob!');
      } else {
        await addPool.request().query(`
          DELETE FROM [Essentials].[MarkerMapping]
          WHERE MarkerID = ${MarkerID};

          DELETE FROM [Essentials].[Marker]
          WHERE MarkerID = ${MarkerID};
        `);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
