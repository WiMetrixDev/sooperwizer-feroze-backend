const getErrorMessage = (error) => {
  let errorMessage = error.message;

  // Unique Key Constraint Error
  if (error.code === "P2002") {
    const uniqueArray = error.meta.target.replace(/UQ_/g, "").split("_");
    const uniqueKeyString = uniqueArray
      .join()
      .replace(/,(?!.*,)/g, `${uniqueArray.length > 2 ? "," : ""} and`)
      .replace(/(?<=[^\s])[A-Z]/g, (match) => ` ${match}`);
    errorMessage = `${
      uniqueArray.length > 1 ? "The Combination Of " : ""
    }${uniqueKeyString} Must Be Unique!`;
  }
  // Foreign Key Constraint Error
  else if (error.code === "P2003") {
    const foreignKeyString = error.meta.field_name
      .replace(/ID/g, "")
      .replace(/(?<=[^\s])[A-Z]/g, (match) => ` ${match}`);
    errorMessage = `The Provided ${foreignKeyString} Is Not Valid!`;
  }
  // Not Found Error
  else if (error.code === "P2025") {
    errorMessage = "Could Not Complete Request! No Record Found";
  } else {
    errorMessage = error.message;
  }
  return errorMessage;
};
module.exports = getErrorMessage;
