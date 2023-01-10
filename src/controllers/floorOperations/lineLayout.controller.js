"use strict";
const errors = require("../../validations/error-handler");
const sql = require("mssql");
const errorHandler = errors.errorHandler;
const getErrorMessage = require("../../utils/getErrorMessage");

module.exports = {
  addLayout: async (request, reply) => {
    const { LayoutName, Revision, StyleTemplateID } = request.body;
    console.log(request.body);
    let query = "";
    try {
      const dbReq = addPool.request();
      dbReq.input("LayoutName", sql.VarChar, LayoutName);
      query = `INSERT INTO LineLayout.Layout
            (LayoutName, Revision, StyleTemplateID)
            OUTPUT inserted.LayoutID
            VALUES(@LayoutName, ${Revision}, ${StyleTemplateID});`;
      const createLayout = await dbReq.query(query);

      const LayoutID = createLayout.recordset[0].LayoutID;

      query = `select LayoutID
             from LineLayout.Layout where LayoutName = '${LayoutName}'`;
      const layoutIDs = await readPool.request().query(query);
      console.log(layoutIDs);

      let layoutIDsArray = [];

      if (layoutIDs.recordset.length > 1) {
        console.log("old");
        layoutIDs.recordset.map((layout) => {
          layoutIDsArray.push(layout.LayoutID);
        });
        console.log(layoutIDsArray);

        query = `UPDATE LineLayout.ActiveLayout
              SET LayoutID = ${LayoutID}, UpdatedAt=getdate()
              WHERE LayoutID in (${layoutIDsArray});
              `;
        console.log("UPT ", query);
        await dbReq.query(query);
      }

      const message = {
        LayoutID: createLayout.recordset[0].LayoutID,
        ...request.body,
      };
      return errorHandler(message);
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getAllLayouts: async (request, reply) => {
    let query = "";
    try {
      const dbReq = addPool.request();
      query = `SELECT tab.*, st.ParentStyleTemplateID
             from(
             select l.LayoutID ,l.Revision ,l.LayoutName,l.StyleTemplateID, 
             ROW_NUMBER () over (Partition by l.LayoutName,l.StyleTemplateID order by Revision DESC) r
             from LineLayout.Layout l) tab 
             left join Essentials.StyleTemplate as st on st.StyleTemplateID = tab.StyleTemplateID
             where r = 1`;
      const getLayouts = await dbReq.query(query);
      return errorHandler(getLayouts.recordset);
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getLayoutByStyleTemplateID: async (request, reply) => {
    const { StyleTemplateID } = request.params;
    let query = "";
    try {
      const dbReq = addPool.request();

      query = `SELECT LayoutID, LayoutName,Revision, StyleTemplateID
            FROM LineLayout.Layout
            Where StyleTemplateID = ${StyleTemplateID}`;
      const getLayoutInfo = await dbReq.query(query);

      return errorHandler(getLayoutInfo.recordset);
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  getLayoutDetailByID: async (request, reply) => {
    const { LayoutID } = request.params;
    let query = "";
    try {
      const dbReq = addPool.request();

      query = `SELECT lo.LayoutID, lo.LayoutName, lo.Revision, st.*, pst.ParentStyleTemplateDescription
            FROM LineLayout.Layout as lo join Essentials.StyleTemplate as st on st.StyleTemplateID = lo.StyleTemplateID
            join Essentials.ParentStyleTemplate as pst on pst.ParentStyleTemplateID = st.ParentStyleTemplateID
            Where LayoutID = ${LayoutID}`;
      const getLayoutInfo = await dbReq.query(query);
      if (getLayoutInfo.recordset.length == 0) {
        return reply.notFound("No Layouts Found!");
      }

      query = `SELECT lmt.LayoutMachineTypeID, lmt.NoOfMachines, lmt.LayoutID, mt.*
            FROM LineLayout.LayoutMachineType lmt full outer join Essentials.MachineType mt on
            lmt.MachineTypeID  = mt.MachineTypeID  Where lmt.LayoutID = ${LayoutID}`;
      const getMachineTypeLayout = await dbReq.query(query);

      query = `SELECT lo.LayoutOperationID, m.*, o.*, w.*
            FROM LineLayout.LayoutOperation lo left join Essentials.Machine m on
            m.MachineID = lo.MachineID left outer join Essentials.Operation o on o.OperationID = lo.OperationID 
            full join Essentials.Worker w on w.WorkerID = lo.WorkerID  Where lo.LayoutID = ${LayoutID}`;
      const getOperationLayout = await dbReq.query(query);

      let obj = {
        ...getLayoutInfo.recordset[0],
        MachineTypes: getMachineTypeLayout.recordset,
        Operations: getOperationLayout.recordset,
      };
      return errorHandler(obj);
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  addOperationLayout: async (request, reply) => {
    //const { LayoutList } = request.body;
    let query = "";
    try {
      request.body.map((layout) => {
        query += ` INSERT INTO LineLayout.LayoutOperation
                (LayoutID, MachineID, OperationID, WorkerID, CreatedAt, UpdatedAt)
                VALUES(${layout.LayoutID}, ${layout.MachineID}, ${
          layout.OperationID ? layout.OperationID : null
        }, ${layout.WorkerID ? layout.WorkerID : null},getdate(), getdate());
                 `;
      });
      const response = await addPool.request().query(query);
      return errorHandler(response);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  addMachineTypeLayout: async (request, reply) => {
    //const { LayoutList } = request.body;
    let query = "";
    try {
      request.body.map((layout) => {
        query += ` INSERT INTO LineLayout.LayoutMachineType
                (LayoutID, MachineTypeID, NoOfMachines, CreatedAt, UpdatedAt)
                VALUES(${layout.LayoutID}, ${layout.MachineTypeID}, ${layout.NoOfMachines} ,getdate(), getdate());
                 `;
      });
      const response = await addPool.request().query(query);
      return errorHandler(response);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  updateMachineType: async (request, reply) => {
    const { NoOfMachines } = request.body;
    const { LayoutMachineTypeID } = request.params;
    let query = "";
    try {
      query = `UPDATE LineLayout.LayoutMachineType
            SET NoOfMachines= ${NoOfMachines}, UpdatedAt=getdate()
            WHERE LayoutMachineTypeID=${LayoutMachineTypeID};
            `;
      await addPool.request().query(query);
      return errorHandler(request.body);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  updateOperationLayout: async (request, reply) => {
    const { LayoutOperationID } = request.params;
    const { MachineID, OperationID, WorkerID } = request.body;
    let query = "";
    try {
      query = `UPDATE LineLayout.LayoutOperation
            SET MachineID=${MachineID}, OperationID=${
        OperationID ? OperationID : null
      }, WorkerID=${WorkerID ? WorkerID : null}, UpdatedAt=getdate()
            WHERE LayoutOperationID=${LayoutOperationID};`;
      await addPool.request().query(query);
      return errorHandler(request.body);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  deleteMachineTypeLayout: async (request, reply) => {
    const { LayoutMachineTypeID } = request.params;
    let query = "";
    try {
      query = `DELETE FROM LineLayout.LayoutMachineType
                WHERE LayoutMachineTypeID=${LayoutMachineTypeID};`;
      await addPool.request().query(query);
      return errorHandler(request.params);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  deleteOperationLayout: async (request, reply) => {
    const { LayoutOperationID } = request.params;
    let query = "";
    try {
      query = `DELETE FROM LineLayout.LayoutOperation
                WHERE LayoutOperationID=${LayoutOperationID};`;
      await addPool.request().query(query);
      return errorHandler(request.params);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  deleteLayout: async (request, reply) => {
    const { LayoutID } = request.params;
    let query = "";
    try {
      query = `DELETE FROM LineLayout.Layout
                WHERE LayoutID=${LayoutID};
                select 1 as success
                `;
      const response = await addPool.request().query(query);
      console.log(response);
      if (response.recordsets.length != 0) {
        return errorHandler(request.params);
      } else {
        const obj = {
          statusCode: 404,
          error: "Failed to delete Layout!",
        };
        return obj;
      }
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getActiveLayouts: async (request, reply) => {
    const { LineID } = request.params;
    let query = "";
    try {
      query = `SELECT al.ActiveLayoutID, l.LayoutID,l.Revision,  al.LineID, al.StyleTemplateID, l.LayoutName
            FROM LineLayout.ActiveLayout as al join LineLayout.Layout as l
            on l.LayoutID = al.LayoutID Where al.LineID = ${LineID} and al.isActive = 1
            `;
      const response = await addPool.request().query(query);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getActiveLayoutsByParentStyleTemplateID: async (request, reply) => {
    const { ParentStyleTemplateID } = request.params;
    let query = "";
    try {
      query = `select * 
               from Essentials.StyleTemplate st join LineLayout.ActiveLayout al
               on al.StyleTemplateID = st.StyleTemplateID where st.ParentStyleTemplateID = ${ParentStyleTemplateID} and al.isActive = 1
            `;
      const response = await addPool.request().query(query);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  getActiveLayoutsByMachineIDs: async (request, reply) => {
    console.log(request.body.Machine);
    const Machines = request.body.Machines;
    console.log(Machines);
    let query = "";
    try {
      query = `select DISTINCT al.*
               from LineLayout.ActiveLayout al join LineLayout.LayoutOperation lo on al.LayoutID = lo.LayoutID
               where MachineID in (${Machines}) and al.isActive = 1
            `;
      console.log(query);

      const response = await addPool.request().query(query);
      console.log(response.recordset);
      return errorHandler(response.recordset);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  setActiveLayouts: async (request, reply) => {
    const { LineID, LayoutID, StyleTemplateID } = request.body;

    let query = "";
    try {
      query = `select *
             from LineLayout.ActiveLayout where LayoutID = ${LayoutID} and LineID = ${LineID} and IsActive = 1`;
      const checkActiveLayout = await readPool.request().query(query);

      if (checkActiveLayout.recordset.length > 0) {
        query = `UPDATE LineLayout.ActiveLayout
                 SET IsActive = 1, DeActivatedAt=NULL, UpdatedAt=getdate()
                WHERE LayoutID = ${checkActiveLayout.recordset.LayoutID};`;
        await addPool.request().query(query);
        return errorHandler(LayoutID);
      }

      query = ` INSERT INTO LineLayout.ActiveLayout
            ( LayoutID, LineID, StyleTemplateID)
            OUTPUT inserted.ActiveLayoutID
            VALUES(${LayoutID}, ${LineID}, ${StyleTemplateID}); `;

      const response = await addPool.request().query(query);
      return errorHandler(response.recordset[0]);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
  deactivateLayout: async (request, reply) => {
    const { ActiveLayoutID } = request.params;
    let query = "";
    try {
      query = `UPDATE LineLayout.ActiveLayout
              SET IsActive = 0, DeActivatedAt=getdate(), UpdatedAt=getdate()
              WHERE ActiveLayoutID = ${ActiveLayoutID};
                `;

      await addPool.request().query(query);
      return errorHandler(request.params);
    } catch (error) {
      return reply.internalServerError(error.toString());
    }
  },
};
