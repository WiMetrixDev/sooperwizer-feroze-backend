'use strict';

const path = require('path');

const util = require('util');
const { kIsMultipart } = require('fastify-formidable');
const mv = require('mv');
const mvPromisified = util.promisify(mv);

const errors = require('../../validations/error-handler.js');
const errorHandler = errors.errorHandler;
const getErrorMessage = require('../../utils/getErrorMessage');
const uploadImage = require('../../utils/uploadImage.js');

module.exports = {
  get: async (request, reply) => {
    const WorkerID = request.params.WorkerID;
    try {
      const { recordset } = await readPool.request().query(`
        SELECT *
        FROM [Essentials].[Worker]
        WHERE WorkerID = ${WorkerID}
      `);

      if (recordset[0]) {
        const message = errorHandler(recordset[0]);
        return message;
      } else {
        return reply.notFound('Worker Does Not Exist!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool
        .request()
        .query(
          `select w.*,m.MachineID from Essentials.Worker as w full outer join Essentials.AllocatedMachines as m on w.WorkerID = m.WorkerID`,
        );

      const mappedData = [];
      for (const row of data.recordset) {
        const existingData = mappedData.find(
          (dataRow) => dataRow.WorkerID === row.WorkerID,
        );
        if (existingData) {
          if (!row.MachineID) continue;
          existingData.AllocatedMachines.push(row.MachineID);
        } else {
          mappedData.push({
            ...row,
            AllocatedMachines: row.MachineID ? [row.MachineID] : [],
          });
        }
      }

      const message = errorHandler(mappedData);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAllWorkersInfo: async (request, reply) => {
    try {
      const data = await readPool
        .request()
        .query(
          `select w.* from Essentials.Worker as w`,
        );

      if (data.recordset.length > 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound('Workers Not Found!');
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  add: async (request, reply) => {
    try {
      const [workerImageColumnParams, workerImageValuesParams] =
        await uploadImage(request, 'Worker', request.body.WorkerCode);
      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[Worker]
        ([WorkerCode]
        ,[WorkerDescription]
        ${workerImageColumnParams}
        )
        VALUES
        ('${request.body.WorkerCode}'
        ,'${request.body.WorkerDescription}'
        ${workerImageValuesParams}
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
            await addPool.request().query(`INSERT INTO [Essentials].[Worker]
                ([WorkerCode]
                ,[WorkerDescription])
                VALUES
                ('${row.WorkerCode}'
                ,'${row.WorkerDescription}')`);
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
    const WorkerID = parseInt(request.params.WorkerID);
    const { WorkerDescription, AllocatedMachines } = request.body;
    const WorkerImageUrl = undefined;
    const WorkerThumbnailUrl = undefined;
    try {
      const workerExists = await readPool.request().query(`SELECT [WorkerID]
        ,[WorkerCode]
        ,[WorkerDescription]
        ,[WorkerImageUrl]
        ,[WorkerThumbnailUrl]
        ,[CreatedAt]
        ,[UpdatedAt]
    FROM [Essentials].[Worker] WHERE WorkerID = ${WorkerID}`);
      if (workerExists.recordset.length == 0) {
        return reply.notFound('Operation Failed! Worker Does Not Exist!');
      }
      const imageParams = await uploadImage(
        request,
        'Worker',
        workerExists.recordset[0].WorkerCode,
        true,
      );
      const workerDescriptionUpdate = request.body.WorkerDescription ?
        `WorkerDescription = '${WorkerDescription}'` :
        '';
      if (workerDescriptionUpdate != '' || imageParams != '') {
        await addPool.request().query(`
        UPDATE [Essentials].[Worker]
          SET
          ${workerDescriptionUpdate}
            ${imageParams}
          WHERE
            WorkerID = ${WorkerID}
      `);
      }

      if (AllocatedMachines) {
        if (AllocatedMachines.length > 0) {
          const RemoveDeletedMachines = await addPool.request().query(`
          delete from [Essentials].[AllocatedMachines]  where MachineID not in (${AllocatedMachines.toString()}) and WorkerID =${WorkerID}
          `);
        } else {
          const RemoveDeletedMachines = await addPool.request().query(`
          delete from [Essentials].[AllocatedMachines]  where  WorkerID =${WorkerID}
          `);
        }

        AllocatedMachines.forEach(async (MachineID) => {
          // check if allocation exists
          const AllocationMachineInsertion = await addPool.request().query(`
          BEGIN
            IF NOT EXISTS (SELECT * FROM [Essentials].[AllocatedMachines]
                            WHERE MachineID = ${MachineID}
                            AND WorkerID = ${WorkerID})
            BEGIN
              INSERT INTO [Essentials].[AllocatedMachines]
              ([WorkerID]
              ,[MachineID])
              VALUES
              (${WorkerID}
              ,${MachineID})
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
  deleteOne: async (request, reply) => {
    const WorkerID = request.params.WorkerID;
    try {
      const worker = await readPool.request().query(`SELECT [WorkerCode]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Worker] WHERE WorkerID = ${WorkerID}`);

      if (worker.recordset.length == 0) {
        return reply.notFound('Worker Does Not Exist!');
      }

      const machineExists = await readPool.request().query(`SELECT
      [CreatedAt]
      ,[UpdatedAt]
  FROM [Essentials].[Machine] WHERE ActiveWorkerID = ${WorkerID}`);

      if (machineExists.recordset.length > 0) {
        return reply.notFound('Operation Failed! Worker Exists In Machine!');
      }

      const pieceWiseScanExists = await readPool.request()
        .query(`SELECT [WorkerID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[PieceWiseScan] WHERE WorkerID = ${WorkerID}`);

      if (pieceWiseScanExists.recordset.length > 0) {
        return reply.notFound(
          'Operation Failed! Worker Exists In PieceWiseScan!',
        );
      }

      const scanExists = await readPool.request().query(`SELECT [WorkerID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[Scan] WHERE WorkerID = ${WorkerID}`);

      if (scanExists.recordset.length > 0) {
        return reply.notFound('Operation Failed! Worker Exists In Scan!');
      }
      const workerScanExists = await readPool.request().query(`SELECT [WorkerID]
      ,[CreatedAt]
      ,[UpdatedAt]
  FROM [Data].[WorkerScan] WHERE WorkerID = ${WorkerID}`);

      if (workerScanExists.recordset.length > 0) {
        return reply.notFound('Operation Failed! Worker Exists In WorkerScan!');
      } else {
        const data = await addPool.request()
          .query(`DELETE FROM [Essentials].[Worker]
          WHERE WorkerID = ${WorkerID}`);
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  assignMachines: async (request, reply) => {
    const { Workers } = request.body;
    // console.log("REQ ",Workers)
    let query = ``;

    try {
      const data = {
        inserted: [],
        insertfail: [],
        deleted: [],
        deletefail: [],
      };

      await Promise.all(
        Workers.map(async (worker) => {
          worker.AllocatedMachines.map(async (MachineID) => {
            try {
              query = `
            IF NOT EXISTS (SELECT * FROM [Essentials].[AllocatedMachines] where WorkerID = '${worker.WorkerID}' and MachineID = '${MachineID}')
            Begin
            INSERT INTO [Essentials].[AllocatedMachines]
            ([WorkerID]
            ,[MachineID])
            VALUES
            ('${worker.WorkerID}'
            ,'${MachineID}')
            end`;
              // console.log("A ",worker.WorkerID," ",MachineID," ", query);
              await addPool.request().query(query);

              data.inserted.push(worker);
            } catch (error) {
              console.log(error);
              // const errorMessage = getErrorMessage(error);
              data.insertfail.push({
                ...worker,
                error: error.message,
              });
            }
          });
          // worker.DeletedMachines.map(async (Machine)=>
          // {
          if (worker.DeletedMachine != '-1') {
            try {
              query = `DELETE FROM [Essentials].[AllocatedMachines]
              Where WorkerID = '${worker.WorkerID}' AND MachineID = ${worker.DeletedMachine}`;
              // console.log("D ",worker," ",worker.DeletedMachine," ", query);
              await addPool.request().query(query);

              data.deleted.push(worker);
            } catch (error) {
              console.log(error);
              // const errorMessage = getErrorMessage(error);
              data.deletefail.push({
                ...worker,
                error: error.message,
              });
            }
          }

          //   })
        }),
      );
      const message = errorHandler(data);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
