const findWorkerByID = {
  schema: {
    params: {
      type: "object",
      required: ["WorkerID"],
      properties: {
        WorkerID: {
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

const findAllWorkers = {
  schema: {
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
          data: {
            type: "array",
          },
        },
      },
    },
  },
};

const insertOneWorkerScan = {
  schema: {
    body: {
      type: "object",
      required: ["WorkerID", "LineID"],
      properties: {
        WorkerID: {
          type: "number",
        },
        LineID: {
          type: "number",
        },
        MachineID: {
          type: "number",
        },
        WorkerOperations: {
          type: "array",
        },
        HasExpired: {
          type: "boolean",
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
      400: {
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

const insertManyWorkers = {
  schema: {
    body: {
      type: "array",
      items: {
        type: "object",
        required: ["WorkerCode", "WorkerDescription"],
        properties: {
          WorkerCode: {
            type: "string",
            minLength: 1,
            maxLength: 64,
          },
          WorkerDescription: {
            type: "string",
            minLength: 1,
            maxLength: 64,
          },
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

const updateOneWorker = {
  schema: {
    params: {
      type: "object",
      required: ["WorkerID"],
      properties: {
        WorkerID: {
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
      400: {
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

/* .................................................. */

const deleteOneWorker = {
  schema: {
    params: {
      type: "object",
      required: ["WorkerID"],
      properties: {
        WorkerID: {
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
      400: {
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

module.exports = {
  findWorkerByID,
  findAllWorkers,
  insertOneWorkerScan,
  insertManyWorkers,
  updateOneWorker,
  deleteOneWorker,
};
