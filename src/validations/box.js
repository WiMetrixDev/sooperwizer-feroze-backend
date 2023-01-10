const findBoxByID = {
  schema: {
    params: {
      type: "object",
      required: ["BoxID"],
      properties: {
        BoxID: {
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

const findAllBoxes = {
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

const insertOneBox = {
  schema: {
    body: {
      type: "object",
      required: ["BoxCode", "IssueDate"],
      properties: {
        BoxCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        // IssueDate: {
        // type: 'number',
        // format: 'date-time'
        // },
      },
    },
    response: {
      200: {
        type: "object",
        required: [
          "statusCode",
          "error",
          // 'data'
        ],
        properties: {
          statusCode: {
            type: "number",
          },
          error: {
            type: "string",
          },
          // data: {}
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

const insertManyBoxes = {
  schema: {
    body: {
      type: "array",
      required: ["BoxCode", "IssueDate"],
      properties: {
        BoxCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        // IssueDate: {
        //   type: 'number',
        // 	format: 'date-time'
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

const updateOneBox = {
  schema: {
    params: {
      type: "object",
      required: ["BoxID"],
      properties: {
        BoxID: {
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

const deleteOneBox = {
  schema: {
    params: {
      type: "object",
      required: ["BoxID"],
      properties: {
        BoxID: {
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
  findBoxByID,
  findAllBoxes,
  insertOneBox,
  insertManyBoxes,
  updateOneBox,
  deleteOneBox,
};
