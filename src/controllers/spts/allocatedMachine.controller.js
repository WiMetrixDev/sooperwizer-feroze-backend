const errors = require("../../validations/error-handler");
const errorHandler = errors.errorHandler;
const getErrorMessage = require("../../utils/getErrorMessage");

module.exports = {
  get: async (request, reply) => {
    const AllocatedMachinesID = request.params.AllocatedMachineID;
    try {
      const data = await readPool.request().query(`SELECT [AllocatedMachinesID]
          ,[WorkerID]
          ,[MachineID]
          ,[CreatedAt]
          ,[UpdatedAt]
      FROM [Essentials].[AllocatedMachines] WHERE AllocatedMachinesID = ${AllocatedMachinesID}`);
      if (data.recordset.length > 0) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("Box Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request().query(`SELECT [AllocatedMachinesID]
        ,[WorkerID]
        ,[MachineID]
        ,[CreatedAt]
        ,[UpdatedAt]
    FROM [Essentials].[AllocatedMachines]`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  add: async (request, reply) => {
    const { WorkerID, MachineID } = request.body;
    try {
      const createOne = await addPool.request()
        .query(`INSERT INTO [Essentials].[AllocatedMachines]
        ([WorkerID]
        ,[MachineID])
        VALUES
        ('${WorkerID}'
        ,'${MachineID}')`);
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
            await addPool.request()
              .query(`INSERT INTO [Essentials].[AllocatedMachines]
              ([WorkerID]
              ,[MachineID])
              VALUES
              (${row.WorkerID}
              ,${row.MachineID})`);
            data.successful.push(row);
          } catch (error) {
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
  update: async (request, reply) => {
    const AllocatedMachinesID = request.params.AllocatedMachinesID;
    const { WorkerID, MachineID } = request.body;
    try {
      const allocatedMachine = await readPool.request()
        .query(`SELECT [AllocatedMachinesID]
        ,[WorkerID]
        ,[MachineID]
        ,[CreatedAt]
        ,[UpdatedAt]
    FROM [Essentials].[AllocatedMachines] WHERE AllocatedMachinesID = ${AllocatedMachinesID}`);

      if (allocatedMachine.recordset.length == 0) {
        return reply.notFound("Allocation Does Not Exist!");
      }
      const update = await addPool.request()
        .query(`UPDATE [Essentials].[AllocatedMachines]
        SET WorkerID = ${WorkerID},
        MachineID = ${MachineID},
        UpdatedAt = getDate()
        WHERE AllocatedMachinesID = ${AllocatedMachinesID}`);

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  delete: async (request, reply) => {
    const AllocatedMachinesID = request.params.AllocatedMachinesID;
    try {
      const box = await readPool.request().query(`SELECT [AllocatedMachinesID]
        ,[WorkerID]
        ,[MachineID]
        ,[CreatedAt]
        ,[UpdatedAt]
    FROM [Essentials].[AllocatedMachines] WHERE AllocatedMachinesID = ${AllocatedMachinesID}`);
      if (box.recordset.length == 0) {
        return reply.notFound("Allocation Does Not Exist!");
      }
      const deletedAllocation = await addPool.request()
        .query(`DELETE FROM [Essentials].[AllocatedMachines]
      WHERE AllocatedMachinesID = ${AllocatedMachinesID}`);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
