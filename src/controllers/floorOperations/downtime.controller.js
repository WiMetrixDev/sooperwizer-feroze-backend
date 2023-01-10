"use strict";

const errors = require("../../validations/error-handler");

const errorHandler = errors.errorHandler;

const getErrorMessage = require("../../utils/getErrorMessage");

module.exports = {
  getMachineDownStatusForLineID: async (request, reply) => {
    const { LineID } = request.params;
    let query = "";
    let message = "";
    try {
      query =
        `select top 1 mdt.MachineDownTimeID,mdt.DownReason,m.*,w.* from [Essentials].MachineDownTime as mdt 
            full outer join [Essentials].Machine as m on m.MachineID = mdt.MachineID
            full outer join [Essentials].AllocatedMachines as am on am.MachineID = mdt.MachineID 
            full outer join [Essentials].Worker as w on w.WorkerID = am.WorkerID where m.LineID = ` +
        `'${LineID}'
            order by mdt.CreatedAt desc`;
      console.log(query);
      let getDowntimeInfo = await readPool.request().query(query);
      if (getDowntimeInfo.recordset.length > 0) {
        message = errorHandler(getDowntimeInfo.recordset);
        return message;
      } else {
        return reply.notFound("Downtime information Not Found!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getDownReasons: async (request, reply) => {
    let query = "";
    let message = "";
    try {
      query = `select * from [Essentials].DownReason`;
      let getDownReason = await readPool.request().query(query);
      if (getDownReason.recordset.length > 0) {
        message = errorHandler(getDownReason.recordset);
        return message;
      } else {
        return reply.notFound("Downtime Reasons Not Found!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getDownTimeReport: async (request, reply) => {
    let query = "";
    let message = "";
    try {
      query = `select l.LineCode,mdt.MachineDownTimeID,mdt.DownReason,mdt.StartTime,mdt.EndTime,m.*,w.* from [Essentials].MachineDownTime as mdt 
            left outer 
            join [Essentials].Machine as m on m.MachineID = mdt.MachineID
            left outer 
            join [Essentials].AllocatedMachines as am on am.MachineID = mdt.MachineID
            left outer 
            join [Essentials].Line as l on l.LineID = m.LineID 
            left outer 
            join [Essentials].Worker as w on w.WorkerID = am.WorkerID`;
      console.log(query);
      let getDownTimeReport = await readPool.request().query(query);
      if (getDownTimeReport.recordset.length > 0) {
        message = errorHandler(getDownTimeReport.recordset);
        return message;
      } else {
        return reply.notFound("No Data Found for DownTime Report!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  insertDownTime: async (request, reply) => {
    const {
      LineID,
      LineCode,
      MachineID,
      MachineCode,
      MachineDescription,
      WorkerID,
      WorkerCode,
      WorkerDescription,
      DownReasonID,
      Reason,
      Remarks,
    } = request.body;
    console.log(request.body);
    let query = "";
    let message = "";
    try {
      query =
        `INSERT INTO Essentials.MachineDownTime
            (MachineID, DownReason, StartTime, EndTime, CreatedAt, UpdatedAt)
            VALUES(` +
        `'${MachineID}',` +
        ` '${Reason}', getdate(), NULL, getdate(), getdate());
            UPDATE Essentials.Machine
            SET  IsMachineDown=1
            WHERE MachineCode='${MachineCode}';`;
      console.log(query);
      let addDownTime = await addPool.request().query(query);

      return errorHandler();
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  endDownTime: async (request, reply) => {
    const { MachineDownTimeID, MachineID } = request.body;
    let query = "";
    let message = "";
    try {
      query =
        `UPDATE Essentials.MachineDownTime
            SET EndTime=getdate(), UpdatedAt=getdate()
            WHERE MachineDownTimeID=` +
        `'${MachineDownTimeID}';
            UPDATE Essentials.Machine
            SET IsMachineDown=0, UpdatedAt=getdate()
            WHERE MachineID= ` +
        `'${MachineID}';`;
      let endDownTime = await addPool.request().query(query);
      return errorHandler();
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
