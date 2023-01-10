const findDepartmentByID = {
  schema: {
    params: {
      type: 'object',
      required: ['DepartmentID'],
      properties: {
        DepartmentID: {
          type: 'number',
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['data', 'statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      404: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const findAllDepartments = {
  schema: {
    response: {
      200: {
        type: 'object',
        required: ['data', 'statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: { type: 'string' },
          data: {
            type: 'array',
          },
        },
      },
    },
  },
};

const insertOneDepartment = {
  schema: {
    body: {
      type: 'object',
      required: ['DepartmentName'],
      properties: {
        DepartmentName: {
          type: 'string',
          minLength: 1,
          maxLength: 64,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        required: [
          'statusCode',
          'error',
          // 'data'
        ],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          // data: {}
        },
      },
      400: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const insertManyDepartments = {
  schema: {
    body: {
      type: 'array',
      required: ['BoxCode'],
      properties: {
        BoxCode: {
          type: 'string',
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
        type: 'object',
        required: ['statusCode', 'error', 'data'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          data: {},
        },
      },
      400: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const updateOneDepartment = {
  schema: {
    params: {
      type: 'object',
      required: ['DepartmentID', 'DepartmentName'],
      properties: {
        DepartmentID: {
          type: 'integer',
          minLength: 1,
        },
        DepartmentName: {
          type: 'string',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'error'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
        },
      },
      400: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
      404: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const deleteOneDepartment = {
  schema: {
    params: {
      type: 'object',
      required: ['DepartmentID'],
      properties: {
        DepartmentID: {
          type: 'number',
          minLength: 1,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        required: ['statusCode', 'error'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
        },
      },
      400: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
      404: {
        type: 'object',
        required: ['statusCode', 'error', 'message'],
        properties: {
          statusCode: {
            type: 'number',
          },
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

module.exports = {
  findDepartmentByID,
  findAllDepartments,
  insertOneDepartment,
  insertManyDepartments,
  updateOneDepartment,
  deleteOneDepartment,
};
