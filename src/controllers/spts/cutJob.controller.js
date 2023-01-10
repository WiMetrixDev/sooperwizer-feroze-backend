'use strict';

const getErrorMessage = require('../../utils/getErrorMessage.js');
const errors = require('../../validations/error-handler.js');
const errorHandler = errors.errorHandler;

module.exports = {
  findByProductionOrderID: async function(request, reply) {
    const ProductionOrderID = request.params.ProductionOrderID;
    try {
      const query = ` SELECT st.StyleTemplateCode, pst.ParentStyleTemplateDescription,cj.*,m.MarkerCode,po.ProductionOrderCode
      FROM [Essentials].[CutJob] as cj
      left join Essentials.StyleTemplate as st on st.StyleTemplateID = cj.StyleTemplateID
      join Essentials.Marker as m
      on cj.MarkerID = m.MarkerID
      join Essentials.ProductionOrder as po
      on cj.ProductionOrderID = po.ProductionOrderID and m.ProductionOrderID = po.ProductionOrderID
      left join Essentials.ParentStyleTemplate as pst on pst.ParentStyleTemplateID = po.StyleTemplateID
      WHERE cj.ProductionOrderID =  ${ProductionOrderID}`;
      console.log(query);
      const data = await readPool.request().query(query);
      if (data.recordset.length != 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound('Cutjob Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findByProductionOrderIDAndSizeAndColor: async function(request, reply) {
    const { Size, Color } = request.params;
    const ProductionOrderID = parseInt(request.params.ProductionOrderID);
    try {
      const data = await readPool.request().query(`SELECT [CutJobID]
    ,[CutNo]
    ,[ProductionOrderID]
    ,[Plies]
    ,[MarkerID]
    ,[CreatedAt]
    ,[UpdatedAt]
    FROM [Essentials].[CutJob] WHERE ProductionOrderID = ${ProductionOrderID} and Size = '${Size}' and Color = '${Color}'`);
      if (data) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound('ProductionOrder Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Returns All CutJob Records In The Database. If The CutJobs' Table Is Empty, Returns Empty Array. */
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT *
    FROM [Essentials].[CutJob]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  addOne: async function(request, reply) {
    const { CutNo, Plies, MarkerID, ProductionOrderID } = request.body;
    try {
      await addPool.request().query(`INSERT INTO [Essentials].[CutJob]
              ([CutNo]
              ,[ProductionOrderID]
              ,[Plies]
              ,[MarkerID])
        VALUES
              ('${CutNo}'
              ,${ProductionOrderID}
              ,${Plies}
              ,${MarkerID})`);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Inserts One Or Many CutJob Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/
  addAll: async function(request, reply) {
    try {
      const data = {
        successful: [],
        failed: [],
      };
      await Promise.all(
        request.body.map(async (row) => {
          try {
            await addPool.request().query(`INSERT INTO [Essentials].[CutJob]
              ([CutNo]
              ,[ProductionOrderID]
              ,[Plies]
              ,[MarkerID])
        VALUES
              ('${row.CutNo}'
              ,${row.ProductionOrderID}
              ,${row.Plies}
              ,${row.MarkerID})`);
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

  /* Edits A Single CutJob Record In The Database. */
  update: async (request, reply) => {
    const CurrentDate = new Date();
    const CutJobID = parseInt(request.params.CutJobID);
    const { CutNo, Plies } = request.body;
    try {
      const cutJob = await addPool.request().query(`SELECT [CutJobID]
      ,[CutNo]
      ,[ProductionOrderID]
      ,[Plies]
      ,[MarkerID]
      ,[CreatedAt]
      ,[UpdatedAt]
      FROM [Essentials].[CutJob] WHERE CutJobID = ${CutJobID}`);

      if (!cutJob) {
        reply.notFound('CutJob Does Not Exist!');
      } else {
        const cutJob = await addPool.request()
          .query(`UPDATE [Essentials].[CutJob]
        SET [CutNo] = '${CutNo}'
           ,[Plies] = ${Plies}
           ,[UpdatedAt] = getDate()
      WHERE CutJobID = ${CutJobID}`);

        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Deletes A Single CutJob Record From The Database. */
  delete: async (request, reply) => {
    const CutJobID = parseInt(request.params.CutJobID);
    try {
      const { recordsets: [cutJobs, cutReports] } = await readPool.request().query(`
        SELECT [CutJobID]
        FROM [Essentials].[CutJob]
        WHERE CutJobID = ${CutJobID};

        SELECT [BundleID]
        FROM [Essentials].[CutReport]
        WHERE CutJobID = ${CutJobID};
      `);
      if (!cutJobs.length) {
        reply.notFound('CutJob Does Not Exist!');
      } else if (cutReports.length) {
        reply.badRequest('Operation Failed! CutJob Exists In Cut Report!');
      } else {
        await addPool.request().query(`
          DELETE FROM [Essentials].[CutJob]
          WHERE CutJobID = ${CutJobID};
        `);

        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
