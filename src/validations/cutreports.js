const findCutReportByID = {
  schema: {
    params: {
      type: "object",
      required: ["CutReportID"],
      properties: {
        CutReportID: {
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

const findCutReportsForCutJobID = {
  schema: {
    params: {
      type: "object",
      required: ["CutJobID"],
      properties: {
        CutJobID: {
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

const findAllCutReports = {
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

const insertOneCutReport = {
  schema: {
    body: {
      type: "object",
      required: [
        "BundleCode",
        "BundleQuantity",
        "CutJobID",
        "RemainingQuantity",
        "ScannedQuantity",
      ],
      properties: {
        BundleCode: { type: "string" },
        BundleQuantity: { type: "number" },
        CutJobID: { type: "number" },
        RemainingQuantity: { type: "number" },
        ScannedQuantity: { type: "number" },
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
          CutReportID: {
            type: "number",
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

const insertManyCutReports = {
  schema: {
    body: {
      type: "object",
      required: ["BundleCode", "BundleQuantity", "CutJobID"],
      properties: {
        BundleCode: { type: "string" },
        BundleQuantity: { type: "number" },
        CutJobID: { type: "number" },
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

const updateOneCutReport = {
  schema: {
    params: {
      type: "object",
      required: ["BundleID"],
      properties: {
        BundleID: { type: "integer", minLength: 1 },
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

const deleteOneCutReport = {
  schema: {
    params: {
      type: "object",
      required: ["BundleID"],
      properties: {
        BundleID: { type: "number", minLength: 1 },
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
  findCutReportByID,
  findCutReportsForCutJobID,
  findAllCutReports,
  insertOneCutReport,
  insertManyCutReports,
  updateOneCutReport,
  deleteOneCutReport,
};
