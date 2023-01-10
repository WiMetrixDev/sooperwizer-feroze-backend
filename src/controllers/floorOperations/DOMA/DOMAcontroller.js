'use strict';
const errors = require('../../../validations/error-handler');
const sql = require('mssql');
const errorHandler = errors.errorHandler;

module.exports = {
  rightFirstTime: async (request, reply) => {
    const { SectionID, LineID } = request.body;
    let query = '';
    try {
      console.log(request.body);
      query = `  select els.BundleID,els.SectionID, els.Status,els.LineID,cr.BundleCode, cr.BundleQuantity , cj.CutNo,
               po.ProductionOrderCode, so.SaleOrderCode from data.EndLineSession els join Essentials.CutReport cr
               on els.BundleID = cr.BundleID join Essentials.CutJob cj on cj.CutJobID  = cr.CutJobID join Essentials.ProductionOrder po
               on po.ProductionOrderID  = cj.ProductionOrderID join Essentials.SaleOrder so on so.SaleOrderID = po.SaleOrderID
               where els.Status = 1 and LineID = ${LineID} and SectionID = ${SectionID} and els.EndLineSessionID not in
               (select EndLineSessionID from data.EndLineFaultLog elfl)
               -- and cast (els.CreatedAt as date) = cast (GETDATE() - 1 as date)
               GROUP BY els.BundleID,els.SectionID, els.Status,els.LineID,cr.BundleCode, cr.BundleQuantity , cj.CutNo,
               po.ProductionOrderCode, so.SaleOrderCode
            `;
      console.log(query);
      const response = await addPool.request().query(query);
      console.log(response.recordset);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getInlineAudits: async (request, reply) => {
    const { SectionID, LineID } = request.body;
    let query = '';
    try {
      query = `  select SUM(afs.MachineRound) as Rounds, afs.WorkerID , m.MachineCode , u.UserName as Auditor
        from [Data].AuditFormSession afs
               join Essentials.[User] u on u.UserID = afs.UserID
               join Essentials.Machine m on m.MachineID = afs.MachineID
               where afs.LineID = ${LineID} and afs.SectionID  = ${SectionID}
               -- and cast (CreatedAt as date) = cast (GETDATE() - 1 as date)
               GROUP BY afs.WorkerID , m.MachineCode , u.UserName `;
      const response = await addPool.request().query(query);
      console.log(response.recordset);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getFaultsAndDHU: async (request, reply) => {
    const { SectionID, LineID } = request.body;
    let query = '';
    try {
      query = `select f.FaultCode,elfl.FaultCount as Quantity, w.WorkerCode, o.OperationCode, u.UserName as Auditor  from data.EndLineSession els
               join data.EndLineFaultLog elfl on els.EndLineSessionID = elfl.EndLineSessionID join data.PieceWiseScan pws
               on pws.PieceWiseScanningID = elfl.PieceWiseScanningID join Essentials.Worker w on w.WorkerID = pws.WorkerID
               join Essentials.Operation o on o.OperationID = pws.OperationID join Essentials.[User] u on u.UserID = els.UserID
               join Essentials.Fault f on f.FaultID = elfl.FaultID
               where els.SectionID = ${SectionID} and els.LineID = ${LineID}
               --GROUP by  w.WorkerCode, o.OperationCode, u.UserName `;
      // console.log("1- ", query);
      let EndLineFaults = await addPool.request().query(query);
      if (EndLineFaults.recordset.length == 0) {
        EndLineFaults = [];
      } else {
        EndLineFaults = EndLineFaults.recordset;
      }
      // console.log(EndLineFaults.recordset);

      query = `    select f.FaultCode, affl.FaultCount as Quantity , w.WorkerCode, o.OperationCode, u.UserName as Auditor from data.AuditFormSession afs
               join data.AuditFormFaultLog affl on afs.AuditFormSessionID  = affl.AuditFormSessionID join Essentials.Worker w on w.WorkerID = afs.WorkerID
               join Essentials.Operation o on o.OperationID = afs.OperationID join Essentials.[User] u on u.UserID = afs.UserID
               join Essentials.Fault f on f.FaultID = affl.FaultID
               where afs.SectionID = ${SectionID}  and afs.LineID = ${LineID}
               -- and cast (CreatedAt as date) = cast (GETDATE() - 1 as date)
               --GROUP by  w.WorkerCode, o.OperationCode, u.UserName `;
      // console.log("2- ", query);
      let AuditFormFaults = await addPool.request().query(query);

      if (AuditFormFaults.recordset.length == 0) {
        AuditFormFaults = [];
      } else {
        AuditFormFaults = AuditFormFaults.recordset;
      }

      query = ` select COUNT (PieceID) as checkedPieces, SUM (FaultCount) as Faults, cast(CreatedAt as date) as CreatedAtDate, SectionID, LineID,
               (SUM (FaultCount)*1.0)/COUNT (PieceID) as DHU
               from
               (select els.*,elfl.FaultCount
               from data.EndLineSession els join data.EndLineFaultLog elfl on elfl.EndLineSessionID = els.EndLineSessionID) as tab1
               where SectionID = ${SectionID} and LineID = ${LineID}
               --and cast (CreatedAt as date) = cast (GETDATE() - 1 as date)
               GROUP BY cast(CreatedAt as date), SectionID, LineID
               `;
      // console.log("3- ", query);

      let DHU = await addPool.request().query(query);

      if (DHU.recordset.length == 0) {
        DHU = parseFloat(0.0);
      } else {
        DHU = DHU.recordset[0].DHU;
      }
      const response = {
        Endline: EndLineFaults,
        Inline: AuditFormFaults,
        DHU: DHU,
      };
      return errorHandler(response);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getThroughput: async (request, reply) => {
    const { SectionID, LineID } = request.body;
    let query = '';
    try {
      query = `  select ThroughputTimeID, SaleOrderID, SaleOrderCode, ProductionOrderID, ProductionOrderCode, CutJobID,
       CutNo, BundleID, BundleCode, [Size], Color, LastOperationID, OperationCode,
       OperationDescription, MachineID, MachineCode, MachineDescription, cast(TimeLapse as time), LineID, SectionID
               from data.ThroughputTime
               where LineID = ${LineID} and SectionID  = ${SectionID}
               --and cast (CreatedAt as date) = cast (GETDATE() - 1 as date) `;
      const response = await addPool.request().query(query);
      // console.log(response.recordset);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getWorkInProgress: async (request, reply) => {
    const { SectionID, LineID } = request.body;
    let query = '';
    try {
      query = `  select *
               from data.Workinprogress
               where LineID = ${LineID} and SectionID  = ${SectionID}
               --and cast (CreatedAt as date) = cast (GETDATE() - 1 as date) `;
      const response = await addPool.request().query(query);
      // console.log(response.recordset);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getAttendance: async (request, reply) => {
    const { LineID } = request.body;
    let query = '';
    try {
      if (LineID) {
        query = `  select *
               from data.FloorAttendanceLineWise
               where LineID = ${LineID}
               -- and cast (CreatedAt as date) = cast (GETDATE() - 1 as date) `;
        const response = await addPool.request().query(query);
        // console.log(response.recordset);
        return errorHandler(response.recordset);
      } else {
        throw new Error('LineID is not valid');
      }
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
};
