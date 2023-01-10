const findMachineByID = {
  schema: {
    params: {
      type: "object",
      required: ["MachineID"],
      properties: {
        MachineID: {
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
    },
  },
};

const findAllMachines = {
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

const insertOneMachine = {
  schema: {
    body: {
      type: "object",
      required: ["MachineCode", "MachineDescription", "Allowance"],
      properties: {
        MachineCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        MachineDescription: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        Allowance: {
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

const insertManyMachines = {
  schema: {
    body: {
      type: "array",
      required: ["MachineCode", "MachineDescription"],
      properties: {
        MachineCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        MachineDescription: {
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

const updateOneMachine = {
  schema: {
    params: {
      type: "object",
      required: ["MachineID"],
      properties: {
        MachineID: {
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

const deleteOneMachine = {
  schema: {
    params: {
      type: "object",
      required: ["MachineID"],
      properties: {
        MachineID: {
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

const findWorkersAllMachines = {
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

module.exports = {
  findMachineByID,
  findAllMachines,
  insertOneMachine,
  insertManyMachines,
  updateOneMachine,
  deleteOneMachine,
  findWorkersAllMachines
};
