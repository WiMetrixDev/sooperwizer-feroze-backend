const findProductionOrderByID = {
  schema: {
    params: {
      type: "object",
      required: ["ProductionOrderID"],
      properties: {
        ProductionOrderID: {
          type: "number",
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["data", "statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
          data: { type: "array" },
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

const findProductionOrdersForSaleOrderID = {
  schema: {
    params: {
      type: "object",
      required: ["SaleOrderID"],
      properties: {
        SaleOrderID: {
          type: "number",
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["data", "statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
          data: {},
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
        },
      },
    },
  },
};

const findByStyleTemplateID = {
  schema: {
    params: {
      type: "object",
      required: ["StyleTemplateID"],
      properties: {
        StyleTemplateID: {
          type: "number",
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["data", "statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
          data: {},
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
        },
      },
    },
  },
};

const findAllProductionOrders = {
  schema: {
    response: {
      200: {
        type: "object",
        required: ["data", "statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          data: {
            type: "array",
          },
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
        },
      },
    },
  },
};

const insertOneProductionOrder = {
  schema: {
    body: {
      type: "object",
      required: [
        "ProductionOrderCode",
        "SaleOrderID",
        "StyleTemplateID",
        "IsFollowOperationSequence",
        // 'MachineDescription',
      ],
      properties: {
        ProductionOrderCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        SaleOrderID: {
          type: "number",
        },
        StyleTemplateID: {
          type: "number",
        },
        IsFollowOperationSequence: {
          type: "boolean",
        },
        // MachineDescription: {
        //   type: 'string',
        //   minLength: 1,
        //   maxLength: 64
        // },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const insertManyProductionOrders = {
  schema: {
    body: {
      type: "array",
      required: [
        "ProductionOrderCode",
        // 'MachineDescription',
      ],
      properties: {
        ProductionOrderCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        // MachineDescription: {
        //   type: 'string',
        //   minLength: 1,
        //   maxLength: 64
        // },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["statusCode", "error", "data"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          data: {},
        },
      },
      400: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const updateOneProductionOrder = {
  schema: {
    params: {
      type: "object",
      required: ["ProductionOrderID"],
      properties: {
        ProductionOrderID: {
          type: "integer",
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
        },
      },
    },
  },
};

const deleteOneProductionOrder = {
  schema: {
    params: {
      type: "object",
      required: ["ProductionOrderID"],
      properties: {
        ProductionOrderID: {
          type: "number",
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          message: { type: "string" },
        },
      },
    },
  },
};

module.exports = {
  findProductionOrderByID,
  findProductionOrdersForSaleOrderID,
  findAllProductionOrders,
  findByStyleTemplateID,
  insertOneProductionOrder,
  insertManyProductionOrders,
  updateOneProductionOrder,
  deleteOneProductionOrder,
};
