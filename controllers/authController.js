const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const uploadFile = require("../utils/uploadFile");

exports.restrictToAdmin = (req, res, next) => {
  if (!req.chat.groupAdmin.equals(req.user._id)) {
    return next(
      new AppError("Only Group Admins are allowed to perform this action", 401),
    );
  }
  next();
};

const signToken = (id) =>
  jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const coookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  res.cookie("jwt", token, coookieOptions);

  user.password = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // Token doesnt exists.
  if (
    (!req.headers.Authorization ||
      !req.headers.Authorization.startsWith("Bearer")) &&
    !req.cookies.jwt
  ) {
    return next(new AppError("JWT token doesn't exists", 401));
  }

  // Acquiring the token.
  const token = req.cookies.jwt || req.headers.Authorization.split(" ")[1];

  if (token === "LOGGED OUT") {
    return next(
      new AppError("You have been logged out please login again", 401),
    );
  }

  // Verifying and getting the decoded token.
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await User.findById(decodedToken.id);

  // Token doesnt correspond to a user.
  if (!user) {
    return next(new AppError("JWT Token doesnt correspond to a user", 400));
  }

  req.user = user;

  next();
});

exports.signup = catchAsync(async (req, res, next) => {
  let photo;
  let mimeType;

  if (req.file) {
    photo = req.file;
    mimeType = photo.mimetype;
  }

  let photoURL;

  if (
    mimeType === "image/png" ||
    mimeType === "image/jpeg" ||
    mimeType === "image/jpg"
  ) {
    photoURL = await uploadFile(photo);
  }

  if (photoURL) req.body.photo = photoURL;

  const user = await User.create(req.body);

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email,
  }).select("+password");

  let correctPassword = false;

  if (user) {
    correctPassword = await user.comparePassword(password, user.password);
  }

  if (!user || !correctPassword) {
    return next(new AppError("Invalid Credentials", 401));
  }

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "LOGGED OUT", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });

  return res.status(200).json({
    status: "success",
  });
});
