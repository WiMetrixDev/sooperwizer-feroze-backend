const findModuleByID = {
  schema: {
    params: {
      type: "object",
      required: ["ModuleID"],
      properties: {
        ModuleID: {
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

const findAllModules = {
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

const insertOneModule = {
  schema: {
    body: {
      type: "object",
      required: ["ModuleCode"],
      properties: {
        ModuleCode: {
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
          statusCode: { type: "number" },
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
};

const insertManyModules = {
  schema: {
    body: {
      type: "array",
      required: ["ModuleCode"],
      properties: {
        ModuleCode: {
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

const updateOneModule = {
  schema: {
    params: {
      type: "object",
      required: ["ModuleID"],
      properties: {
        ModuleID: {
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

const deleteOneModule = {
  schema: {
    params: {
      type: "object",
      required: ["ModuleID"],
      properties: {
        ModuleID: {
          type: "number",
          minLength: 1,
        },
      },
    },
    response: {
      200: {
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
  findModuleByID,
  findAllModules,
  insertOneModule,
  insertManyModules,
  updateOneModule,
  deleteOneModule,
};
