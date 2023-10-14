const User = require("../models/User");
const ApiFeatures = require("../utils/apiFeatures");
const { catchAsync } = require("../utils/catchAsync");

exports.getUsers = catchAsync(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    User.find({
      _id: { $ne: req.user._id },
    }),
    req.query,
  )
    .search(["name", "email"])
    .filters()
    .paginator()
    .sort()
    .select();

  const users = await apiFeatures.query;

  return res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});
