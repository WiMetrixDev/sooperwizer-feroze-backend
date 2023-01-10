const getOperationsForWorkerID = {
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

const getDetailsForWorkerID = {
  schema: {
    body: {
      type: "object",
      required: ["WorkerID", "SectionID"],
      properties: {
        WorkerID: {
          type: "number",
          minLength: 1,
        },
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
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

const registerFault = {
  schema: {
    body: {
      type: "object",
      required: ["AuditFormSessionID", "Faults"],
      properties: {
        WorkerID: {
          type: "number",
          minLength: 1,
        },
        Faults: {
          type: "object",
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
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

const getFaults = {
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
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

const checkRoundForMachine = {
  schema: {
    body: {
      type: "object",
      required: ["MachineID", "MachineRound"],
      properties: {
        MachineID: {
          type: "number",
          minLength: 1,
        },
        MachineRound: {
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
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

const getFaultsAndCheckListHistory = {
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
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

const createAuditFormSession = {
  schema: {
    body: {
      type: "array",
      required: [
        "DefectedPieces",
        "RoundColor",
        "WorkerID",
        "Operations",
        "UserID",
        "LineID",
        "SectionID",
        "MachineID",
        "MachineRound",
        "CheckList",
        "FollowUp",
      ],
      properties: {
        DefectedPieces: {
          type: "number",
          minLength: 1,
        },
        RoundColor: {
          type: "string",
        },
        WorkerID: {
          type: "number",
        },
        Operations: {
          type: "number",
        },
        UserID: {
          type: "number",
        },
        LineID: {
          type: "number",
        },
        SectionID: {
          type: "number",
        },
        MachineID: {
          type: "number",
        },
        MachineRound: {
          type: "number",
        },
        CheckList: {
          type: "object",
        },
        FollowUp: {
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
  getOperationsForWorkerID,
  getDetailsForWorkerID,
  getFaults,
  registerFault,
  createAuditFormSession,
  checkRoundForMachine,
  getFaultsAndCheckListHistory,
};
