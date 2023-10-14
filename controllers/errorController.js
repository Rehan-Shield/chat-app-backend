function handleDevError(req, res, error) {
  return res.status(error.statusCode).json({
    status: error.status,
    statusCode: error.statusCode,
    error: error,
    message: error.message,
    stack: error.stack,
  });
}

function handleProdError(req, res, error) {
  return res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
}

module.exports = (error, req, res, next) => {
  console.log(error.message);
  console.log(error.stack);

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    handleDevError(req, res, error);
  } else {
    handleProdError(req, res, error);
  }
};
