class AppError extends Error {
  constructor(parameter, statusCode) {
    super(parameter);
    this.statusCode = statusCode || 500;
    this.status = this.statusCode.toString().startsWith("4") ? "fail" : "error";
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
