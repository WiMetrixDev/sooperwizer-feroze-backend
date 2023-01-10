'use strict';

const path = require('path');

const util = require('util');
const { kIsMultipart } = require('fastify-formidable');
const mv = require('mv');
const mvPromisified = util.promisify(mv);

const errors = require('../../validations/error-handler');

const errorHandler = errors.errorHandler;

const getErrorMessage = require('../../utils/getErrorMessage');
const uploadImage = require('../../utils/uploadImage');

module.exports = {
  get: async (request, reply) => {
    const { MachineID } = request.params;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT
          M.*,
          MT.MachineTypeCode,
          MT.MachineTypeDescription
        FROM [Essentials].Machine as M
        FULL OUTER JOIN [Essentials].MachineType as MT
          ON M.MachineID = MT.MachineTypeID
        WHERE MachineID = ${MachineID};
      `);
      if (recordset[0]) {
        const message = errorHandler(recordset[0]);
        return message;
      } else {
        return reply.notFound('Machine Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request()
        .query(`SELECT m.*,mt.MachineTypeCode,mt.MachineTypeDescription,mp.OperationID,
					b.ZoneTopic, b.CurrentAddress
					FROM [Essentials].Machine as m
					JOIN [Essentials].MachineType as mt
					ON m.MachineTypeID = mt.MachineTypeID
					FULL OUTER JOIN [Essentials].[MachineOperations] as mp
					ON m.MachineID = mp.MachineID
					LEFT JOIN [Essentials].Box as b
					ON m.BoxID = b.BoxID
	  `);

      const mappedData = [];
      for (const row of data.recordset) {
        const existingData = mappedData.find(
          (dataRow) => dataRow.MachineID === row.MachineID,
        );
        if (existingData) {
          if (!row.OperationID) continue;
          existingData.Operations.push(row.OperationID);
        } else {
          mappedData.push({
            ...row,
            Operations: row.OperationID ? [row.OperationID] : [],
          });
        }
      }
      const message = errorHandler(mappedData);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  add: async (request, reply) => {
    try {
      const [imageColumnParams, imageValueParams] = await uploadImage(
        request,
        'Machine',
        request.body.MachineCode,
      );

      await addPool.request()
        .query(`INSERT INTO [Essentials].[Machine]
        ([MachineCode]
        ,[MachineDescription]
        ,[MachineTypeID]
        ${imageColumnParams}
        )
        VALUES
        ('${request.body.MachineCode}'
        ,'${request.body.MachineDescription}'
        ,'${request.body.MachineTypeID}'
        ${imageValueParams}
        )`);
      const message = errorHandler();
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
      await Promise.all(
        request.body.map(async (row) => {
          try {
            await addPool.request().query(`INSERT INTO [Essentials].[Machine]
            ([MachineCode]
            ,[MachineDescription]
            ,[MachineTypeID])
            VALUES
            ('${row.MachineCode}'
            ,'${row.MachineDescription}'
            ,${row.MachineTypeID})`);
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
  update: async (request, reply) => {
    try {
      const MachineID = parseInt(request.params.MachineID);
      const MachineTypeID = parseInt(request.body.MachineTypeID);
      const ActiveWorkerID = parseInt(request.body.ActiveWorkerID);
      const BoxID = parseInt(request.body.BoxID);
      const body = request.body;
      const operations = request.body.Operations;
      const machineExists = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[Machine]
        WHERE MachineID = ${MachineID};
      `);
      if (machineExists.recordset.length == 0) {
        return reply.notFound('Operation Failed! Machine Does Not Exist!');
      }
      if (MachineTypeID) {
        const { recordset } = await readPool.request().query(`
          SELECT MachineTypeID
          FROM [Essentials].[MachineType]
          WHERE MachineTypeID = ${MachineTypeID};
        `);
        if (!recordset.length) {
          return reply.badRequest(
            'Operation Failed! MachineType Does Not Exist!',
          );
        }
      }
      if (ActiveWorkerID) {
        const { recordset } = await readPool.request().query(`
          SELECT MachineID
          FROM Essentials].[Machine]
          WHERE
            MachineID != ${MachineID}
            AND ActiveWorkerID = ${ActiveWorkerID};
        `);
        if (!recordset.length) {
          return reply.badRequest(
            'Worker Is Already Assigned To Another Machine!',
          );
        }
      }

      if (BoxID) {
        const boxExists = await readPool.request().query(`
          SELECT BoxID
          FROM [Essentials].[Box]
          WHERE BoxID = ${BoxID};
        `);
        if (!boxExists.recordset.length) {
          return reply.badRequest('Given Box Does Not Exists!');
        }
        const boxAssigned = await readPool.request().query(`
          SELECT *
          FROM Essentials.Machine
          WHERE BoxID = ${BoxID};
        `);
        if (!boxAssigned.recordset.length) {
          return reply.badRequest('Given Box Is Already Assigned!');
        }
      }
      const imageParams = await uploadImage(
        request,
        'Machine',
        machineExists.recordset[0].MachineCode,
        true,
      );

      const machineTypeParam = body.MachineTypeID ?
        `,MachineTypeID = ${parseInt(body.MachineTypeID)}` :
        '';
      const getNonNullableParam = (key) => (
        body[key] ?
          `,${key} ='${body[key]}'` :
          ''
      );
      const getNullableParam = (key) => (
        body[key] !== undefined && !isNaN(body[key]) ?
          `,${key} = ${body[key] === null || body[key] === 'null' ?
            'NULL' :
            parseInt(body[key])
          }` :
          ''
      );
      const machineDescriptionParam = getNonNullableParam('MachineDescription');
      const activeWorkerParam = getNullableParam('ActiveWorkerID');
      const lineParam = getNullableParam('LineID');
      const boxParam = getNullableParam('BoxID');

      await addPool.request().query(`
        UPDATE [Essentials].[Machine]
        SET
          UpdatedAT = getDate()
          ${imageParams}
          ${machineDescriptionParam}
          ${machineTypeParam}
          ${activeWorkerParam}
          ${lineParam}
          ${boxParam}
        WHERE MachineID = ${MachineID}
      `);
      if (!operations || operations.length == 0) {
        const removeAllOperations = await addPool.request().query(`
			    delete from Essentials.MachineOperations
          where MachineID = ${MachineID}
				`);
      }
      if (operations?.length > 0) {
        const queryy = `
				delete from Essentials.MachineOperations where OperationID not in (${operations.toString()}) and MachineID = ${MachineID}
				`;
        const RemoveDeletedOperations = await addPool.request().query(queryy);

        operations.forEach(async (Operation) => {
          // check if allocation exists
          const AllocationMachineInsertion = await addPool.request().query(`
          BEGIN
            IF NOT EXISTS (SELECT * FROM [Essentials].[MachineOperations]
                            WHERE MachineID = ${MachineID} and OperationID = ${Operation})
            BEGIN
              INSERT INTO [Essentials].[MachineOperations]
              ([MachineID]
              ,[OperationID])
              VALUES
              (${MachineID}
              ,${Operation})
            END
          END
          `);
        });
      }

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  deleteOne: async function(request, reply) {
    const MachineID = request.params.MachineID;
    try {
      const machine = await readPool.request().query(`SELECT [MachineID]
      ,[MachineCode]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Machine] WHERE MachineID = ${MachineID}`);

      if (machine.recordset.length == 0 || machine.recordset == null) {
        reply.notFound('Machine Does Not Exist!');
      }

      const workerScanExists = await readPool.request()
        .query(`SELECT [MachineID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[WorkerScan] WHERE MachineID = ${MachineID}`);

      if (workerScanExists.recordset.length > 0) {
        reply.notFound('Operation Failed! Machine Exists In WorkerScan!');
      }

      const scanExists = await readPool.request().query(`SELECT [MachineID]
      ,[CreatedAt]
      ,[UpdatedAt]
      FROM [Data].[Scan] WHERE MachineID = ${MachineID}`);

      if (scanExists.recordset.length > 0) {
        reply.badRequest('Operation Failed! Machine Exists In scanExists!');
      }

      const pieceWiseScanExists = await readPool.request()
        .query(`SELECT [MachineID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[PieceWiseScan] WHERE MachineID = ${MachineID}`);

      if (pieceWiseScanExists.recordset.length > 0) {
        reply.badRequest('Operation Failed! Machine Exists In PieceWiseScan!');
      } else {
        const data = await addPool.request()
          .query(`DELETE FROM [Essentials].[Machine]
          WHERE MachineID = ${MachineID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  machineAssignment: async (request, reply) => {
    const { MachineID } = request.params;
    const Workers = request.body.Workers ? request.body.Workers : null;
    const Operations = request.body.Operations ? request.body.Operations : null;
    const LineID =
      request.body.LineID !== undefined ? request.body.LineID : undefined;
    console.log(request.body);
    let query = ``;
    try {
      if (Workers !== null) {
        query = `delete from Essentials.AllocatedMachines where MachineID = ${MachineID}`;
        await addPool.request().query(query);

        query = '';
        Workers.map(async (worker) => {
          query += `
            INSERT INTO [Essentials].[AllocatedMachines]
            ([WorkerID]
            ,[MachineID])
            VALUES
            ('${worker}'
            ,'${MachineID}')`;
        });
        await addPool.request().query(query);
      }

      if (Operations !== null) {
        query = '';
        query = `delete from Essentials.MachineOperations  where MachineID = ${MachineID}`;
        await addPool.request().query(query);

        query = '';
        Operations.map(async (operation) => {
          query += `
            INSERT INTO [Essentials].[MachineOperations]
            ([OperationID]
            ,[MachineID])
            VALUES
            ('${operation}'
            ,${MachineID})`;
        });
        console.log(query);
        await addPool.request().query(query);
      }

      if (LineID !== undefined) {
        console.log('here');
        query = `UPDATE Essentials.Machine
                SET  LineID = ${LineID}
                WHERE MachineID = ${MachineID}`;
        console.log(query);
        await addPool.request().query(query);
      }

      const message = errorHandler();
      return message;
    } catch (error) {
      console.log(error);
      return reply.internalServerError(error.message.toString());
    }
  },
  getAllocatedWorkers: async (request, reply) => {
    const MachineID = request.params.MachineID;
    try {
      const data = await readPool.request()
        .query(`SELECT WorkerID
      					FROM [Essentials].AllocatedMachines
						WHERE MachineID = ${MachineID}`);

      const workerIDs = data.recordset.map((row) => row.WorkerID);

      const message = errorHandler(workerIDs);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
