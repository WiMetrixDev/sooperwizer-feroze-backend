const findPieceWiseCutReportByID = {
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

const findAllPieces = {
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

const insertOnePiece = {
  schema: {
    body: {
      type: "object",
      required: [
        "BundleID",
        "PieceNumber",
        // 'MachineDescription',
      ],
      properties: {
        BundleID: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        PieceNumber: {
          type: "number",
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
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const insertManyPieces = {
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

const updateOnePiece = {
  schema: {
    body: {
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

const deleteOnePiece = {
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
  findPieceWiseCutReportByID,
  findAllPieces,
  insertOnePiece,
  insertManyPieces,
  updateOnePiece,
  deleteOnePiece,
};
