const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // const error = err;
  // console.log(err);
  // console.log("in duplicate key error1");

  // console.log(error);
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // // const value = err.keyValue;
  // console.log(value);
  // console.log(`//////// ${err.message}`);
  // console.log(`......error is:${err}`);
  // console.log("in duplicate key error");
  // const message = `Duplicate field value:${value}. Please use another value!`;
  // return new AppError(message, 400);
  return new AppError(err, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
  // console.log("in dev error");
  // console.log("this is error" + err);
  res.status(err.statusCode).json({
    status: err.status,
    // error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // console.log("in sendErrorProd" + err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    // console.error("ERROR:", err);

    // 2) Send generic message
    // console.log(`.....${process.env.NODE_ENV}`);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  // console.log("error called");
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // console.log(`"${process.env.NODE_ENV}"`);
  if (process.env.NODE_ENV === "development ") {
    // console.log("Dev error");
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // console.log(err);
    // let error = { ...err };

    if (err.name === "CastError") err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") err = handleJWTError();
    if (err.name === "TokenExpiredError") err = handleJWTExpiredError();

    sendErrorProd(err, res);
  }
};
