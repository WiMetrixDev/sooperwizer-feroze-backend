const findLineByID = {
  schema: {
    params: {
      type: "object",
      required: ["LineID"],
      properties: {
        LineID: {
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

const findAllLines = {
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
          data: {
            type: "array",
          },
        },
      },
    },
  },
};

const insertOneLine = {
  schema: {
    body: {
      type: "object",
      required: ["LineCode", "LineDescription"],
      properties: {
        LineCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        LineDescription: {
          type: "string",
          minLength: 1,
          maxLength: 64,
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

const insertManyLines = {
  schema: {
    body: {
      type: "array",
      required: ["LineCode", "LineDescription"],
      properties: {
        LineCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        LineDescription: {
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

const updateOneLine = {
  schema: {
    params: {
      type: "object",
      required: ["LineID"],
      properties: {
        LineID: {
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

const deleteOneline = {
  schema: {
    params: {
      type: "object",
      required: ["LineID"],
      properties: {
        LineID: {
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
  findLineByID,
  findAllLines,
  insertOneLine,
  insertManyLines,
  updateOneLine,
  deleteOneline,
};
