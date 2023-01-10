"use strict";
const errors = require("../../validations/error-handler");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");
module.exports = {
  getOperationsForWorkerID: async (request, reply) => {
    const WorkerID = request.params.WorkerID;
    try {
      let query = `select o.*, s.SectionID, s.SectionCode, s.SectionDescription,
       null as HostIP, null as ShortAddress, null as LongAddress
       from Essentials.Operation as o join Essentials.Section as s on o.SectionID = s.SectionID`;
      let data = await readPool.request().query(query);
      //console.log(data);
      if (data.recordset.length == 0) {
        return reply.notFound("Operations for Worker not found!");
      }
      const obj = {
        statusCode: 200,
        error: "Success!",
        message: `Operation Successful`,
        data: data.recordset,
      };
      return obj;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  getDetailsForWorkerID: async (request, reply) => {
    const WorkerID = request.body.WorkerID;
    const SectionID = request.body.SectionID;
    // console.log(WorkerID);
    try {
      let data = await readPool.request()
        .query(`select o.OperationID, l.LineID, l.LineCode, l.LineDescription, m.MachineID, m.MachineCode, m.MachineDescription,
    o.OperationCode, o.OperationName, o.OperationDescription, w.WorkerID, w.WorkerCode, w.WorkerDescription, m.BoxID ,b.ZoneTopic, b.CurrentAddress 
    ,sc.SectionID, sc.SectionCode, sc.SectionDescription, null as HostIP, null as ShortAddress, null as LongAddress 
    from Data.PieceWiseScan as s 
    join Essentials.Worker as w on s.WorkerID = w.WorkerID 
    join Essentials.Line as l on l.LineID = s.LineID 
    join Essentials.Machine as m on m.MachineID = s.MachineID
    left join Essentials.Box b on m.BoxID = b.BoxID 
    join Essentials.Operation as o on s.OperationID = o.OperationID 
    join Essentials.section as sc on o.SectionID = sc.SectionID
    where s.WorkerID = ${WorkerID} 
    order by s.CreatedAt desc`);
      if (data.recordset.length == 0) {
        return reply.notFound("Worker details not found!");
      }

      //       console.log(`select * from Essentials.Operation as o
      //       join Essentials.Section as s on o.SectionID = s.SectionID
      //        where OperationID = ${data.recordset[0].OperationID}`);

      //       let getSection = await readPool.request()
      //         .query(`select s.SectionID from Essentials.Operation as o
      //       join Essentials.Section as s on o.SectionID = s.SectionID
      //        where OperationID = ${data.recordset[0].OperationID}`);

      //       console.log(" 1 ", getSection.recordset[0].SectionID, " 2 ", SectionID);

      //       if (getSection.recordset[0].SectionID != SectionID) {
      //         return reply.notFound("Worker details not found!");
      //       }
      const message = errorHandler(data.recordset[0]);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  getFaults: async (request, reply) => {
    const SectionID = request.params.SectionID;
    let obj;
    try {
      let getSections = await readPool.request().query(`SELECT MappedSectionID
        FROM Essentials.SectionMapping Where SectionID = ${SectionID}`);

      let sections = [];
      sections.push(SectionID);
      if (getSections.recordset.length > 0) {
        getSections.recordset.map((section) => {
          sections.push(section.MappedSectionID);
        });
      }
      // console.log(`select * from Essentials.Fault
      // where SectionID in (${sections}) and FaultID != ${1}`);

      let data = await readPool.request().query(`select * from Essentials.Fault 
      where SectionID in (${sections}) and FaultID != ${1}`);
      console.log(data.recordset);
      if (data.recordset.length == 0) {
        obj = {
          statusCode: 200,
          error: "No Faults found!",
          message: "No faults exists for given section!",
        };
        return obj;
      } else {
        obj = {
          statusCode: 200,
          error: "Success!",
          message: "Operation Successful!",
          data: data.recordset,
        };
        return obj;
      }
    } catch (error) {
      console.log(error)
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  registerFault: async (request, reply) => {
    const AuditFormSessionID = request.body.AuditFormSessionID;
    const Faults = JSON.parse(request.body.Faults);
    //const Faults = request.body.Faults;
    let insertFault;
    let getFault;
    let data;

    try {
      await Promise.all(
        Faults.map(async (fault) => {
          getFault = await readPool.request()
            .query(`select * from Essentials.Fault 
      where FaultID = ${parseInt(fault.FaultID)}`);
          if (!getFault) {
            return reply.notFound(`Fault ${fault.FaultID} not found!`);
          }

          data = await addPool.request()
            .query(`INSERT INTO [Data].[AuditFormFaultLog]
          ([AuditFormSessionID]
          ,[FaultID]
          ,[FaultCount])
    VALUES
          (${AuditFormSessionID}
          ,${fault.FaultID}
          ,${fault.FaultCount})`);
        })
      );
      const message = errorHandler();
      return message;
    } catch (error) {
      const errorStr = error.toString();
      reply.internalServerError(errorStr);
    }
  },
  createAuditFormSession: async (request, reply) => {
    const DefectedPieces = request.body.DefectedPieces;
    const RoundColor = request.body.RoundColor;
    const WorkerID = request.body.WorkerID;
    const OperationID = request.body.OperationID;
    const UserID = request.body.UserID;
    const LineID = request.body.LineID;
    const SectionID = request.body.SectionID;
    const MachineID = request.body.MachineID;
    const MachineRound = request.body.MachineRound;
    const CheckList = JSON.parse(request.body.CheckList); //when sending data from android
    const FollowUp = request.body.FollowUp;
    //console.log(CheckList);
    //const CheckList = request.body.CheckList; //when sending from postman
    let response = {};
    let data;
    let obj;
    let getChecklist;
    let insertAuditForm;
    try {
      if (
        !DefectedPieces ||
        !RoundColor ||
        !WorkerID ||
        !OperationID ||
        !UserID ||
        !LineID ||
        !SectionID ||
        !MachineID ||
        !MachineRound
      ) {
        return reply.internalServerError("Insufficient parameters");
      }
      //TO CHECK IF ROUND AND MACHINE IS UNIQUE
      let checkUnique = await readPool.request()
        .query(`select top 1 * from Data.AuditFormSession where MachineID = ${MachineID} and MachineRound = '${MachineRound}'
      and FollowUp = '${FollowUp}' and CreatedAtDate = cast(getdate() as date)`);

      if (checkUnique.recordset.length != 0) {
        await addPool.request().query(`UPDATE Data.AuditFormSession
        SET
        FollowUp = '${FollowUp}'
        WHERE MachineID = ${MachineID} and MachineRound = '${MachineRound}' and FollowUp = '${FollowUp}' 
        and CreatedAtDate = cast(getdate() as date)`);

        obj = {
          statusCode: 200,
          error: `Machine round has already been completed today`,
          message: `Machine with ID ${MachineID} , Round ${MachineRound}  has already been done today`,
        };
        return obj;
      }

      try {
        insertAuditForm = await addPool.request()
          .query(`INSERT INTO [Data].[AuditFormSession]
        ([WorkerID]
        ,[OperationID]
        ,[UserID]
        ,[LineID]
        ,[SectionID]
        ,[MachineID]
        ,[MachineRound]
        ,[FollowUp]
        ,[DefectedPieces]
        ,[RoundColor]
        ,[CreatedAtDate])
        OUTPUT INSERTED.[AuditFormSessionID]
  VALUES
        (${WorkerID}
        ,${OperationID}
        ,${UserID}
        ,${LineID}
        ,${SectionID}
        ,${MachineID}
        ,'${MachineRound}'
        ,'${FollowUp}'
        ,${DefectedPieces}
        ,'${RoundColor}'
        ,cast(getdate() as date))`);
      } catch (error) {
        const errorStr = error.toString();
        reply.internalServerError(errorStr);
      }

      await Promise.all(
        CheckList.map(async (list) => {
          data = await addPool.request()
            .query(`INSERT INTO [Data].[CheckListResponseLog]
          ([AuditFormSessionID]
          ,[CheckListDescription]
          ,[Response])
    VALUES
          (${insertAuditForm.recordset[0].AuditFormSessionID}
          ,'${list.CheckListDescription}'
          ,'${list.Response}')`);
        })
      );
      obj = {
        statusCode: 200,
        error: "Success!",
        message: `Operation Successful`,
        data: insertAuditForm.recordset[0],
      };
      return obj;
    } catch (error) {
      console.log(error);
      const errorStr = error.toString();
      return reply.internalServerError(errorStr);
    }
  },
  checkRoundForMachine: async (request, reply) => {
    const MachineID = request.body.MachineID;
    const MachineRound = request.body.RoundID;
    // console.log(" 1 ", MachineID, " 2 ", MachineRound);
    let obj;
    try {
      // console.log(`select top 1 * from Data.AuditFormSession where MachineID = ${MachineID}
      //and MachineRound = '${MachineRound}' and CreatedAtDate = cast(getdate() as date) order by CreatedAt desc`);

      let getRound = await readPool.request()
        .query(`select top 1 * from Data.AuditFormSession where MachineID = ${MachineID}
        and MachineRound = '${MachineRound}' and CreatedAtDate = cast(getdate() as date) order by CreatedAt desc`);

      //console.log(getRound);

      if (getRound.recordset.length == 0) {
        obj = {
          statusCode: 200,
          error: "Success!",
          message: "First Time in this Round!",
        };
        return obj;
      }
      //  else if (
      //   getRound.recordset[0].RoundColor == "YELLOW" ||
      //   getRound.recordset[0].RoundColor == "GREEN"
      // ) {
      //   console.log("Y & G");
      //   obj = {
      //     statusCode: 200,
      //     error: "This Round has already been completed!",
      //     message: "This Round has already been completed!",
      //     // FollowUp: getRound.recordset[0].FollowUp,
      //   };
      //   return obj;
      // }
      else {
        obj = {
          statusCode: 200,
          error: "This Round has already been completed!",
          message: "This Round has already been completed!",
          //    FollowUp: getRound.recordset[0].FollowUp,
        };
        return obj;
      }

      //return obj;
    } catch (error) {
      console.log(error);
      const errorStr = error.toString();
      return reply.internalServerError(errorStr);
    }
  },
  getFaultsAndCheckListHistory: async (request, reply) => {
    const MachineID = request.params.MachineID;
    let data = [];
    let getHistory;
    let obj;
    try {
      // console.log();
      let getSections = await readPool.request().query(`SELECT MappedSectionID
        FROM Essentials.SectionMapping Where SectionID = ${SectionID}`);

      let sections = [];
      sections.push(SectionID);
      if (getSections.recordset.length > 0) {
        getSections.recordset.map((section) => {
          sections.push(section.MappedSectionID);
        });
      }
      getHistory = await readPool.request().query(
        `select a.AuditFormSessionID,a.DefectedPieces,a.FollowUp,a.LineID,a.MachineID,a.MachineRound, a.OperationID,a.RoundColor
        ,a.SectionID,a.UserID,a.WorkerID, w.WorkerCode, w.WorkerDescription, l.LineCode, l.LineDescription, m.MachineCode, m.MachineDescription,
        s.SectionCode,s.SectionDescription, o.OperationCode, o.OperationDescription, o.OperationName
        from Data.AuditFormSession as a 
        join Essentials.Worker as w on a.WorkerID = w.WorkerID
        join Essentials.Machine as m on a.MachineID = m.MachineID
        join Essentials.Line as l on a.LineID = l.LineID
        join Essentials.Section as s on s.SectionID = a.SectionID
        join Essentials.Operation as o on o.OperationID = a.OperationID
         where a.MachineID = ${MachineID} and a.SectionID in (${sections})
          and CreatedAtDate = CAST(GETDATE() as DATE)
          order by a.CreatedAt desc`
      );
      if (getHistory.recordset.length == 0) {
        obj = {
          statusCode: 200,
          error: "Failed!",
          message: "No records found for today!",
        };
        return obj;
      }

      let round1flag = 0;
      let round2flag = 0;
      let round3flag = 0;
      let round4flag = 0;

      for (let i = 0; i < getHistory.recordset.length; i++) {
        let result = {};

        let getFaultsHistory = await readPool.request()
          .query(` select a.AuditFormSessionID,a.DefectedPieces,a.FollowUp,a.LineID,a.MachineID,a.MachineRound,a.OperationID,a.RoundColor
          ,a.SectionID,a.UserID,a.WorkerID, w.WorkerCode, w.WorkerDescription, l.LineCode, l.LineDescription, m.MachineCode, m.MachineDescription,
          s.SectionCode,s.SectionDescription, o.OperationCode, o.OperationDescription, o.OperationName, afl.FaultCount, afl.FaultID, f.FaultCode, f.FaultDescription
          from Data.AuditFormFaultLog as afl
          join Data.AuditFormSession as a on afl.AuditFormSessionID = a.AuditFormSessionID
          join Essentials.Worker as w on a.WorkerID = w.WorkerID
          join Essentials.Machine as m on a.MachineID = m.MachineID
          join Essentials.Line as l on a.LineID = l.LineID
          join Essentials.Section as s on s.SectionID = a.SectionID
          join Essentials.Operation as o on o.OperationID = a.OperationID
          join Essentials.Fault as f on f.FaultID = afl.FaultID
        where afl.AuditFormSessionID = ${getHistory.recordset[i].AuditFormSessionID} `);

        let getChecklistHistory = await readPool.request()
          .query(`select * from Data.CheckListResponseLog 
        where AuditFormSessionID = ${getHistory.recordset[i].AuditFormSessionID}
        order by CreatedAt desc`);

        if (round1flag == 1 && getHistory.recordset[i].MachineRound == 1) {
          result = {
            Session: getHistory.recordset[i],
            Faults: getFaultsHistory.recordset,
            CheckList: [],
          };
        } else if (
          round2flag == 1 &&
          getHistory.recordset[i].MachineRound == 2
        ) {
          result = {
            Session: getHistory.recordset[i],
            Faults: getFaultsHistory.recordset,
            CheckList: [],
          };
        } else if (
          round3flag == 1 &&
          getHistory.recordset[i].MachineRound == 3
        ) {
          result = {
            Session: getHistory.recordset[i],
            Faults: getFaultsHistory.recordset,
            CheckList: [],
          };
        } else if (
          round4flag == 1 &&
          getHistory.recordset[i].MachineRound == 4
        ) {
          result = {
            Session: getHistory.recordset[i],
            Faults: getFaultsHistory.recordset,
            CheckList: [],
          };
        } else {
          result = {
            Session: getHistory.recordset[i],
            Faults: getFaultsHistory.recordset,
            CheckList: getChecklistHistory.recordset,
          };
        }

        if (getHistory.recordset[i].MachineRound == 1 && round1flag == 0) {
          round1flag = 1;
        } else if (
          getHistory.recordset[i].MachineRound == 2 &&
          round2flag == 0
        ) {
          round2flag = 1;
        } else if (
          getHistory.recordset[i].MachineRound == 3 &&
          round3flag == 0
        ) {
          round3flag = 1;
        } else if (
          getHistory.recordset[i].MachineRound == 4 &&
          round4flag == 0
        ) {
          round4flag = 1;
        }

        data.push(result);
      }
      const message = errorHandler(data);
      return message;
    } catch (error) {
      const errorStr = error.toString();
      return reply.internalServerError(errorStr);
    }
  },
};
