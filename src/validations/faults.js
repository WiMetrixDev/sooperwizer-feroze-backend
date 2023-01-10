const findFaultByID = {
  schema: {
    params: {
      type: "object",
      required: ["FaultID"],
      properties: {
        FaultID: {
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

const findAllFaults = {
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

const findBySectionID = {
  schema: {
    params: {
      type: "object",
      required: ["SectionID"],
      properties: {
        SectionID: {
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

const insertOneFault = {
  schema: {
    body: {
      type: "object",
      required: ["FaultCode", "FaultDescription", "SectionID"],
      properties: {
        FaultCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        FaultDescription: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        SectionID: {
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

const insertManyFaults = {
  schema: {
    body: {
      type: "array",
      required: ["FaultCode", "FaultDescription"],
      properties: {
        FaultCode: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
        FaultDescription: {
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

const updateOneFault = {
  schema: {
    params: {
      type: "object",
      required: ["FaultID"],
      properties: {
        FaultID: {
          type: "integer",
          minLength: 1,
        },
      },
    },
    body: {
      type: "object",
      required: ["SectionID"],
      properties: {
        SectionID: {
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

const deleteOneFault = {
  schema: {
    params: {
      type: "object",
      required: ["FaultID"],
      properties: {
        FaultID: {
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

module.exports = {
  findFaultByID,
  findAllFaults,
  findBySectionID,
  insertOneFault,
  insertManyFaults,
  updateOneFault,
  deleteOneFault,
};
