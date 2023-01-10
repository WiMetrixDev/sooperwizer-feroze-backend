"use strict";

const getErrorMessage = require("../../utils/getErrorMessage.js");
const errors = require("../../validations/error-handler.js");
const { add } = require("./saleOrder.controller.js");
const errorHandler = errors.errorHandler;

/* Returns A Single ProductionOrder Record Based On ProductionOrderID. */
module.exports = {
  findProductionOrderByID: async (request, reply) => {
    const ProductionOrderID = request.params.ProductionOrderID;
    try {
      const data = await readPool.request()
        .query(`select * from Essentials.ProductionOrder as p join Essentials.StyleTemplate as st on st.StyleTemplateID = p.StyleTemplateID join Essentials.SaleOrder as s
      on s.SaleOrderID = p.SaleOrderID where ProductionOrderID = ${ProductionOrderID} `);
      if (data) {
        const message = errorHandler(data.recordset[0]);
        return message;
      } else {
        return reply.notFound("ProductionOrder Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findProductionOrdersForSaleOrderID: async (request, reply) => {
    const SaleOrderID = request.params.SaleOrderID;
    let data = [];
    try {
      const ProductionOrders = await readPool.request()
        .query(`SELECT p.ProductionOrderID, p.ProductionOrderCode, p.SaleOrderID, p.StyleTemplateID as ParentStyleTemplateID,
      p.IsFollowOperationSequence, p.IsPoClosed, pst.ParentStyleTemplateDescription, s.SaleOrderCode from Essentials.ProductionOrder as p 
      full outer join Essentials.ParentStyleTemplate as pst on pst.ParentStyleTemplateID = p.StyleTemplateID
      join Essentials.SaleOrder as s
            on s.SaleOrderID = p.SaleOrderID where p.SaleOrderID = ${SaleOrderID}`);

      await Promise.all(
        await ProductionOrders.recordset.map(async (PO) => {
          let getPOclients = await readPool
            .request()
            .query(
              `select * from Essentials.ProductionOrderClient where ProductionOrderID = ${PO.ProductionOrderID}`
            );
          data.push({
            ...PO,
            ProductionOrderClients: getPOclients.recordset,
          });
        })
      );
      const message = errorHandler(data);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Returns All ProductionOrder Records In The Database. If The ProductionOrders' Table Is Empty, Returns Empty Array. */
  getAll: async (request, reply) => {
    try {
      const data = await readPool.request()
        .query(`select p.*, st.ParentStyleTemplateDescription as StyleTemplateCode , s.SaleOrderCode from Essentials.ProductionOrder as p 
        full outer join Essentials.ParentStyleTemplate as st 
        on st.ParentStyleTemplateID  = p.StyleTemplateID 
        join Essentials.SaleOrder as s
              on s.SaleOrderID = p.SaleOrderID`);
      const message = errorHandler(data.recordset);
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  findByStyleTemplateID: async (request, reply) => {
    const StyleTemplateID = parseInt(request.params.StyleTemplateID);
    try {
      const data = await readPool.request()
        .query(`select * from Essentials.ProductionOrder as p join Essentials.ParentStyleTemplate as st 
        on st.ParentStyleTemplateID = p.StyleTemplateID join Essentials.SaleOrder as s
      on s.SaleOrderID = p.SaleOrderID where st.ParentStyleTemplateID = ${StyleTemplateID}`);
      if (data) {
        const message = errorHandler(data.recordset);
        return message;
      } else {
        return reply.notFound("ProductionOrder Does Not Exist!");
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  addOne: async (request, reply) => {
    const { ProductionOrderCode, SaleOrderID } = request.body;

    try {
      if (IsFollowOperationSequence === "false") {
        IsFollowOperationSequence = 0;
      } else {
        IsFollowOperationSequence = 1;
      }

      await addPool.request(0).query(`INSERT INTO [Essentials].[ProductionOrder]
      ([ProductionOrderCode]
      ,[SaleOrderID]
      )
      VALUES
      ('${ProductionOrderCode}'
      ,${SaleOrderID})`);

      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Inserts One Or Many ProductionOrder Records In The Database. Takes Into Consideration File Upload Functionality When Required.*/
  addAll: async (request, reply) => {
    try {
      // console.log(request.body)
      const data = {
        successful: [],
        failed: [],
      };
      await Promise.all(
        request.body.map(async (row) => {
          try {
            if (!row.IsFollowOperationSequence) {
              row.IsFollowOperationSequence = 0;
            } else {
              row.IsFollowOperationSequence = 1;
            }
            let query = `
        DECLARE @ProductionOrderID INT;
        BEGIN
        IF NOT EXISTS (SELECT * FROM [Essentials].[ProductionOrder] WHERE SaleOrderID = ${row.SaleOrderID} 
          and ProductionOrderCode = '${row.ProductionOrderCode}')
          BEGIN
            INSERT INTO [Essentials].[ProductionOrder]
            ([ProductionOrderCode]
              ,[SaleOrderID]
              ,[IsFollowOperationSequence]
              )
            VALUES
            ('${row.ProductionOrderCode}'
            ,${row.SaleOrderID}
            ,${row.IsFollowOperationSequence}
          )
          END
        Select  @ProductionOrderID = ProductionOrderID FROM [Essentials].[ProductionOrder] where
        SaleOrderID = ${row.SaleOrderID} and ProductionOrderCode = '${row.ProductionOrderCode}'
        END
        Select @ProductionOrderID as ProductionOrderID
        `;
            // console.log(query)
            let ProductionOrder = await addPool.request().query(query);

            if (ProductionOrder.recordset.length > 0) {
              await Promise.all(
                row.ProductionOrderClients.map(async (client) => {
                  let ProductionOrderClient = await addPool.request().query(`
                  DECLARE @ErrorCode INT;
                  BEGIN
                  IF NOT EXISTS (SELECT * FROM [Essentials].[ProductionOrderClient]
                    WHERE Size ='${client.Size}' and Color ='${client.Color}' and ProductionOrderID = ${ProductionOrder.recordset[0].ProductionOrderID})
                    BEGIN
                      INSERT INTO [Essentials].[ProductionOrderClient]
                      ( 
                        [ProductionOrderID]
                        ,[Size]
                        ,[Color])
                      VALUES
                      ('${ProductionOrder.recordset[0].ProductionOrderID}'
                      ,'${client.Size}'
                      ,'${client.Color}'
                     )
                     SELECT @ErrorCode = 0
                    END
                  ELSE
                    BEGIN 
                      SELECT @ErrorCode = 1
                    END
                  END
                  `);
                })
              );
            }

            data.successful.push(row);
          } catch (error) {
            console.log(error);
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
  // addAll: async (request, reply) => {
  //   try {
  //     const data = {
  //       successful: [],
  //       failed: [],
  //     };
  //     await Promise.all(
  //       request.body.map(async (row) => {
  //         try {
  //           if (!row.IsFollowOperationSequence) {
  //             row.IsFollowOperationSequence = 0;
  //           } else {
  //             row.IsFollowOperationSequence = 1;
  //           }
  //           await addPool.request()
  //             .query(`INSERT INTO [Essentials].[ProductionOrder]
  //             ([ProductionOrderCode]
  //             ,[SaleOrderID]
  //             )
  //       VALUES
  //             ('${row.ProductionOrderCode}'
  //             ,${row.SaleOrderID}
  //             )`);
  //           data.successful.push(row);
  //         } catch (error) {
  //           data.failed.push({
  //             ...row,
  //             error: error.message,
  //           });
  //         }
  //       })
  //     );
  //     const message = errorHandler(data);
  //     return message;
  //   } catch (error) {
  //     return reply.internalServerError(error.message.toString());
  //   }
  // },

  /* Edits A Single ProductionOrder Record In The Database. */
  update: async (request, reply) => {
    const CurrentDate = new Date();
    const ProductionOrderID = request.params.ProductionOrderID;
    const { IsFollowOperationSequence, ParentStyleTemplateID } = request.body; //here StyleTemplateID is ParentStyleTemplateID
    try {
      let query = "";
      const productionOrder = await readPool
        .request()
        .query(`select * from [Essentials].[ProductionOrder]`);
      if (!productionOrder) {
        return reply.notFound("ProductionOrder Does Not Exist!");
      }
      if (ParentStyleTemplateID) {
        {
          query = `UPDATE [Essentials].[ProductionOrder]
          SET 
             [StyleTemplateID] = ${ParentStyleTemplateID}
             ,[IsFollowOperationSequence] = ${IsFollowOperationSequence ? 1 : 0}
             ,[UpdatedAt] = getDate()
        WHERE ProductionOrderID = ${ProductionOrderID}`;
          await addPool.request().query(query);

          const message = errorHandler();
          return message;
        }
      } else {
        if (!ParentStyleTemplateID || ParentStyleTemplateID == null) {
          await addPool.request().query(`UPDATE [Essentials].[ProductionOrder]
          SET 
             [StyleTemplateID] = ${null},
             [IsFollowOperationSequence] = ${IsFollowOperationSequence ? 1 : 0}
             ,[UpdatedAt] = getDate()
        WHERE ProductionOrderID = ${ProductionOrderID}`);
          const message = errorHandler();
          return message;
        } else {
          await addPool.request().query(`UPDATE [Essentials].[ProductionOrder]
          SET 
             [IsFollowOperationSequence] = ${IsFollowOperationSequence}
             ,[UpdatedAt] = getDate()
        WHERE ProductionOrderID = ${ProductionOrderID}`);
          const message = errorHandler();
          return message;
        }
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },

  /* Deletes A Single ProductionOrder Record From The Database. */
  delete: async (request, reply) => {
    const ProductionOrderID = request.params.ProductionOrderID;
    try {
      const productionOrder = await readPool
        .request()
        .query(
          `select * from [Essentials].[ProductionOrder] where ProductionOrderID = ${ProductionOrderID}`
        );
      if (productionOrder.recordset.length === 0) {
        reply.notFound("MachineType Does Not Exist!");
      }
      const cutJobExists = await readPool
        .request()
        .query(
          `select * from [Essentials].[CutJob] where ProductionOrderID = ${ProductionOrderID}`
        );
      if (cutJobExists.recordset.length !== 0) {
        reply.badRequest("Operation Failed! ProductionOrder Exists In CutJob!");
      }
      const markerExists = await readPool
        .request()
        .query(
          `select * from [Essentials].[Marker] where ProductionOrderID = ${ProductionOrderID}`
        );
      if (markerExists.recordset.length !== 0) {
        reply.badRequest("Operation Failed! ProductionOrder Exists In Marker!");
      } else {
        const deletedPOClient = await addPool
          .request()
          .query(
            `Delete from [Essentials].[ProductionOrderClient] where ProductionOrderID = ${ProductionOrderID}`
          );
        const deletedProductionOrder = await addPool
          .request()
          .query(
            `Delete from [Essentials].[ProductionOrder] where ProductionOrderID = ${ProductionOrderID}`
          );
        const message = errorHandler();
        return message;
      }
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
  closePO: async (request, reply) => {
    const { ProductionOrders } = request.body;
    console.log(ProductionOrders);
    try {
      let closeSm = await addPool.request()
        .query(`UPDATE Essentials.ProductionOrder
      SET  UpdatedAt=getdate(), IsPoClosed=1
      Where ProductionOrderID in(${ProductionOrders.toString()}) `);
      const message = errorHandler();
      return message;
    } catch (error) {
      return reply.internalServerError(error.message.toString());
    }
  },
};
