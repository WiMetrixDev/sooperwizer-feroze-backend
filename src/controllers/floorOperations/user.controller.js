'use strict';

const path = require('path');
const util = require('util');
const { kIsMultipart } = require('fastify-formidable');
const mv = require('mv');
const mvPromisified = util.promisify(mv);

const errors = require('../../validations/error-handler.js');
const uploadImage = require('../../utils/uploadImage.js');
const { update } = require('../spts/machine.controller.js');
const errorHandler = errors.errorHandler;

const signin = async function(request, reply) {
  const UserName = request.body.UserName;
  const Password = request.body.Password;
  try {
    const dbArray = await readPool.request()
      .query(`SELECT u.*,s.SectionCode,s.SectionDescription
       FROM [Essentials].[User] as u join [Essentials].[Section] as s
     on u.SectionID = s.SectionID WHERE UserName = '${UserName}'`);
    if (dbArray.recordset.length == 0) {
      return reply.notFound('No User With This UserName Exists!');
    } else if (dbArray.recordset[0].Password == Password) {
      return reply
        .code(200)
        .header('Content-Type', 'application/json; charset=utf-8')
        .send({
          statusCode: 200,
          error: 'Success!',
          message: 'Sign-In Successful!',
          data: { ...dbArray.recordset[0], token: 'token' },
        });
    } else {
      return reply.notAcceptable('Incorrect Signin Information!');
    }
  } catch (error) {
    reply.internalServerError(error.message);
  }
};

const signup = async function(request, reply) {
  try {
    if (!request[kIsMultipart]) {
      return reply.badRequest('Request Must Be A Multi-Part Form');
    }

    const UserName = request.body.UserName;
    const Password = request.body.Password;
    const UserType = request.body.UserType;
    const LineID = parseInt(request.body.LineID);
    const SectionID = parseInt(request.body.SectionID);

    const [imageColumnParams, imageValueParams] = await uploadImage(
      request,
      'User',
      UserName,
    );
    const cerateUser = await addPool.request()
      .query(`INSERT INTO [Essentials].[User]
    ([UserName]
    ,[Password]
    ,[UserType]
    ,[LineID]
    ,[SectionID]
    ${imageColumnParams})
    VALUES
    ('${UserName}'
    ,'${Password}'
    ,'${UserType}'
    ,${LineID}
    ,${SectionID}
    ${imageValueParams}
    )`);
    const message = errorHandler();
    return message;
  } catch (error) {
    return reply.badRequest(error.toString());
  }
};

const findAllUsers = async (request, reply) => {
  try {
    const data = await readPool
      .request()
      .query(`SELECT * FROM [Essentials].[User]`);
    const message = errorHandler(data.recordset);
    return message;
  } catch (error) {
    return reply.internalServerError(error.toString());
  }
};

const resetPassword = async (request, reply) => {
  const { UserID, NewPassword, OldPassword } = request.body;
  try {
    const query = `select * from [Essentials].[User] WHERE UserID = ${UserID}`;
    const getUser = await readPool.request().query(query);
    console.log('USer@@@', getUser.recordset[0]);
    if (getUser.recordset.length === 0) {
      return reply.notFound('No User Found!');
    } else if (getUser.recordset[0].Password !== OldPassword) {
      return reply.notFound('Old Password is Not Correct!');
    } else if (getUser.recordset[0].Password === NewPassword) {
      return reply.notFound('New Password Should not be same as old Password!');
    }

    const updateQuery = `
      	UPDATE [Essentials].[User]
        SET
        Password = '${NewPassword}',
		UpdatedAt = getDate()
        WHERE UserID = ${UserID}
      `;
    console.log('updateQuery@@@', updateQuery);
    await addPool.request().query(updateQuery);


    const message = errorHandler();
    return message;
  } catch (error) {
    return reply.internalServerError(error.message.toString());
  }
};

module.exports = {
  signin,
  signup,
  findAllUsers,
  resetPassword,
};
