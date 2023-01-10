function errorHandler(data) {
  if (data) {
    const obj = {
      statusCode: 200,
      error: "Success!",
      message: "Operation Successful!",
      data: data,
    };
    return obj;
  } else {
    const obj = {
      statusCode: 200,
      error: "Success!",
    };
    return obj;
  }
}
module.exports = {
  errorHandler,
};
