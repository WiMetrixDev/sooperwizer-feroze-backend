const findPieceWiseScanByID = {
  schema: {
    params: {
      type: "object",
      required: ["PieceID"],
      properties: {
        PieceID: {
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
          message: { type: "string" },
        },
      },
    },
  },
};

const findAllPieceWiseScans = {
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
          message: { type: "string" },
        },
      },
    },
  },
};

const insertOnePieceWiseScan = {
  schema: {
    body: {
      type: "object",
      required: [
        "BundleID",
        "ScanID",
        "PieceID",
        "OperationID",
        "WorkerID",
        "LineID",
        "MachineID",
        "PieceWiseGroupID",
        "ScanID",
        // 'MachineDescription',
      ],
      properties: {
        BundleID: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        ScanID: { type: "number" },
        PieceID: { type: "number" },
        OperationID: { type: "number" },
        WorkerID: { type: "number" },
        LineID: {},
        MachineID: { type: "number" },
        PieceWiseGroupID: { type: "number" },
        ScanID: { type: "number" },
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

const insertManyPieceWiseScans = {
  schema: {
    body: {
      type: "array",
      required: [
        "BundleID",
        // 'MachineDescription',
      ],
      properties: {
        BundleID: {
          type: "string",
          minLength: 1,
          maxLength: 64,
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

const updateOnePieceWiseScan = {
  schema: {
    params: {
      type: "object",
      required: ["PieceID"],
      properties: {
        PieceID: {
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

const deleteOnePieceWiseScan = {
  schema: {
    params: {
      type: "object",
      required: ["PieceID"],
      properties: {
        PieceID: {
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
  findPieceWiseScanByID,
  findAllPieceWiseScans,
  insertOnePieceWiseScan,
  insertManyPieceWiseScans,
  updateOnePieceWiseScan,
  deleteOnePieceWiseScan,
};
