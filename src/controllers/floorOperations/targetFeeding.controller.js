"use strict";

const errors = require("../../validations/error-handler");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");

module.exports = {
  get: async (request, reply) => {
    const TargetFeedingID = request.params.TargetFeedingID;
    try {
      const data = await readPool.request().query(`SELECT [TargetFeedingID]
      ,[TargetDate]
      ,[TargetShift]
      ,[LineID]
      ,[SectionID]
      ,[PlanEfficiency]
      ,[PlanProduction]
      ,[ManPower]      
  FROM [Essentials].[TargetFeeding] WHERE TargetFeedingID = ${TargetFeedingID}`);
      if (data.recordset.length > 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("TargetFeeding Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(
        `SELECT [TargetFeedingID]
          ,[TargetDate]
          ,[TargetShift]
          ,l.LineID,l.LineCode
          ,s.SectionID,s.SectionCode
          ,[PlanEfficiency]
          ,[PlanProduction]   
          ,[ManPower]   
      FROM [Essentials].[TargetFeeding] as t 
      join [Essentials].[Line] as l on l.LineID = t.LineID
      join [Essentials].[Section] as s on s.SectionID = t.SectionID`
      );
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  add: async (request, reply) => {
    const {
      TargetDate,
      TargetShift,
      LineID,
      PlanEfficiency,
      PlanProduction,
      ManPower,
    } = request.body;
    try {
      const sectionExists = await readPool
        .request()
        .query(`SELECT TOP 1 * FROM [Essentials].[Section]`);
      if (sectionExists.recordset.length == 0) {
        return reply.badRequest("Operation Failed! No Section Exists!");
      }
      //console.log(request.body);
      const data = await addPool.request()
        .query(`INSERT INTO [Essentials].[TargetFeeding]
          ([TargetDate]
           ,[TargetShift]
           ,[LineID]
           ,[SectionID]
           ,[PlanEfficiency]
           ,[PlanProduction]
           ,[ManPower]   )
      VALUES
          ('${TargetDate}'
           ,'${TargetShift}'
           ,${LineID}
           ,${sectionExists.recordset[0].SectionID}
           ,${PlanEfficiency}
           ,${PlanProduction}
           ,${ManPower})`);
      const message = errorHandler(data);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  addMany: async (request, reply) => {
    try {
      const data = {
        successful: [],
        failed: [],
      };
      const sectionExists = await readPool
        .request()
        .query(`SELECT TOP 1 * FROM [Essentials].[Section]`);
      if (sectionExists.recordset.length == 0) {
        return reply.badRequest("Operation Failed! No Section Exists!");
      }
      await Promise.all(
        request.body.map(async (row) => {
          try {
            await addPool.request()
              .query(`INSERT INTO [Essentials].[TargetFeeding]
                ([TargetDate]
                ,[TargetShift]
                ,[LineID]
                ,[SectionID]
                ,[PlanEfficiency]
                ,[PlanProduction]
                ,[ManPower])
            VALUES
                ('${row.TargetDate}'
                ,'${row.TargetShift}'
                ,${row.LineID}
                ,${sectionExists.recordset[0].SectionID}
                ,${row.PlanEfficiency}
                ,${row.PlanProduction}
                ,${row.ManPower})`);
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
  },

  addColorEfficiency: async (request, reply) => {
    const { LineID, LineCode, EfficiencyRangeStart, EfficiencyRangeEnd, Color } =
      request.body;
      console.log(request.body)
    //const sqlRequest = new sql.Request();
    try {
      var query = `
			DECLARE @STATUS int;
			BEGIN
			IF NOT EXISTS (SELECT * FROM [Essentials].[LineWiseColorEfficiency] WHERE LineID =${LineID} AND Color='${Color}')
				BEGIN
					INSERT INTO [Essentials].[LineWiseColorEfficiency]
						([LineID]
						,[LineCode]
						,[Color]
						,[EfficiencyRangeStart]
						,[EfficiencyRangeEnd])
					VALUES
						(${LineID}
						,'${LineCode}'
						,'${Color}'
						,${EfficiencyRangeStart}
						,${EfficiencyRangeEnd});
						SELECT @STATUS = 1 ;
				END
			ELSE
				BEGIN
					UPDATE [Essentials].[LineWiseColorEfficiency] SET
					EfficiencyRangeStart = ${EfficiencyRangeStart}
					, EfficiencyRangeEnd = ${EfficiencyRangeEnd}
					, UpdatedAt = getDate()
					WHERE LineID =${LineID} AND Color='${Color}';
					SELECT @STATUS = 0 ;
				END
			END
			SELECT @STATUS AS ERRORCODE;
			`;
      console.log(query)
      const sqlResponse = await addPool.request().query(query);
      console.log(sqlResponse.recordset);
      const message = errorHandler(sqlResponse.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  getColorEfficiencyByLine: async (request, reply) => {
    const { id } = request.params;
    //const sqlRequest = new sql.Request();
    try {
      const sqlResponse = await readPool
        .request()
        .query(
          `SELECT * FROM Essentials.[LineWiseColorEfficiency] WHERE LineID = ${id}`
        );
      const message = errorHandler(sqlResponse.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  update: async (request, reply) => {
    const TargetFeedingID = request.params.TargetFeedingID;
    const { PlanEfficiency, PlanProduction, ManPower } = request.body;
    try {
      const TargetFeeding = await readPool.request()
        .query(`SELECT [TargetFeedingID]
      ,[TargetDate]
      ,[TargetShift]
      ,[LineID]
      ,[SectionID]
      ,[PlanEfficiency]
      ,[PlanProduction]
      ,[ManPower]   
  FROM [Essentials].[TargetFeeding] WHERE TargetFeedingID = ${TargetFeedingID}`);
      if (TargetFeeding.recordset.length == 0) {
        reply.notFound("TargetFeeding Does Not Exist!");
      } else {
        const data = await addPool.request()
          .query(`UPDATE [Essentials].[TargetFeeding]
        SET  [PlanEfficiency] = ${parseFloat(PlanEfficiency)},
        [PlanProduction] = ${parseFloat(PlanProduction)},
        [ManPower] = ${parseInt(ManPower)},
        [UpdatedAt] = getDate()
        WHERE TargetFeedingID = ${TargetFeedingID}`);
        const message = errorHandler(data);
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  deleteOne: async function (request, reply) {
    const TargetFeedingID = request.params.TargetFeedingID;
    try {
      const TargetFeeding = await readPool.request()
        .query(`SELECT [TargetFeedingID]
      ,[TargetDate]
      ,[TargetShift]
      ,[LineID]
      ,[SectionID]
      ,[PlanEfficiency]
      ,[PlanProduction] 
      ,[ManPower]  
  FROM [Essentials].[TargetFeeding] WHERE TargetFeedingID = ${TargetFeedingID}`);

      if (
        TargetFeeding.recordset.length == 0 ||
        TargetFeeding.recordset == null
      ) {
        return reply.notFound("TargetFeeding Does Not Exist!");
      }

      const deletedTargetFeeding = await addPool.request()
        .query(`DELETE FROM [Essentials].[TargetFeeding]
        WHERE TargetFeedingID = ${TargetFeedingID}`);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
