const findCutJobsByID = {
  schema: {
    params: {
      type: "object",
      required: ["CutJobID"],
      properties: {
        CutJobID: {
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
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      500: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const findByProductionOrderID = {
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
        required: ["data", "statusCode", "error"],
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
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      500: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const findAllCutJobs = {
  schema: {
    response: {
      200: {
        type: "object",
        required: ["data", "statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
          data: { type: "array" },
        },
      },
    },
  },
};

const insertOneCutJob = {
  schema: {
    body: {
      type: "object",
      required: ["CutNo", "ProductionOrderID", "Plies", "MarkerID"],
      properties: {
        CutNo: { type: "number", minLength: 1, maxLength: 64 },
        ProductionOrderID: { type: "number", minLength: 1, maxLength: 64 },
        Plies: { type: "number", minLength: 1, maxLength: 64 },
        MarkerID: { type: "number", minLength: 1, maxLength: 64 },
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
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const insertManyCutJobs = {
  schema: {
    body: {
      type: "array",
      items: {
        type: "object",
        required: ["CutNo", "ProductionOrderID", "Plies", "MarkerID"],
        properties: {
          CutNo: { type: "number", minLength: 1, maxLength: 64 },
          ProductionOrderID: { type: "number", minLength: 1, maxLength: 64 },
          Plies: { type: "number", minLength: 1, maxLength: 64 },
          MarkerID: { type: "number", minLength: 1, maxLength: 64 },
        },
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
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const updateOneCutJob = {
  schema: {
    params: {
      type: "object",
      required: ["CutJobID"],
      properties: {
        CutJobID: { type: "integer", minLength: 1 },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
        },
      },
      400: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const deleteOneCutJob = {
  schema: {
    params: {
      type: "object",
      required: ["CutJobID"],
      properties: {
        CutJobID: { type: "number", minLength: 1 },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["statusCode", "error"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
        },
      },
      400: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
      404: {
        type: "object",
        required: ["statusCode", "error", "message"],
        properties: {
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

module.exports = {
  findCutJobsByID,
  findAllCutJobs,
  findByProductionOrderID,
  insertOneCutJob,
  insertManyCutJobs,
  updateOneCutJob,
  deleteOneCutJob,
};
