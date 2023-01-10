const findStyleBulletinByID = {
  schema: {
    params: {
      type: "object",
      required: ["StyleBulletinID"],
      properties: {
        StyleBulletinID: {
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

const findAllStyleBulletins = {
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

const findByStyleTemplateID = {
  schema: {
    params: {
      type: "object",
      required: ["StyleTemplateID"],
      properties: {
        StyleTemplateID: {
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

const insertOneStyleBulletin = {
  schema: {
    body: {
      type: "object",
      required: [
        "StyleTemplateID",
        "OperationID",
        "OperationSequence",
        "ScanType",
        "IsFirst",
        "IsLast",
        "MachineTypeID",
        // 'MachineDescription',
      ],
      properties: {
        StyleBulletinCode: {
          type: "number",
        },
        OperationID: {
          type: "number",
        },
        OperationSequence: {
          type: "number",
        },
        ScanType: {
          type: "string",
        },
        IsFirst: {
          type: "boolean",
        },
        IsLast: {
          type: "boolean",
        },
        MachineTypeID: {
          type: "number",
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

const insertManyStyleBulletins = {
  schema: {
    body: {
      type: "array",
      required: [
        "StyleBulletinCode",
        // 'MachineDescription',
      ],
      properties: {
        StyleBulletinCode: {
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

const updateOneStyleBulletin = {
  schema: {
    params: {
      type: "object",
      required: ["StyleBulletinID"],
      properties: {
        StyleBulletinID: {
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

const updateByStyleTemplateID = {
  schema: {
    body: {
      type: "object",
      required: ["toAdd", "toUpdate", "toDelete"],
      properties: {
        toAdd: {
          type: "array",
        },
        toUpdate: {
          type: "array",
        },
        toDelete: {
          type: "array",
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

const deleteOneStyleBulletin = {
  schema: {
    params: {
      type: "object",
      required: ["MachineTypeID"],
      properties: {
        MachineTypeID: {
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
  findStyleBulletinByID,
  findAllStyleBulletins,
  findByStyleTemplateID,
  insertOneStyleBulletin,
  insertManyStyleBulletins,
  updateOneStyleBulletin,
  updateByStyleTemplateID,
  deleteOneStyleBulletin,
};
