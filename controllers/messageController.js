const Chat = require("../models/Chat");
const Message = require("../models/Message");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

exports.sendMessage = catchAsync(async (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    return next(
      new AppError("No content provided along with the message", 404),
    );
  }

  const message = await Message.create({
    content,
    chat: req.chat._id,
    sender: req.user._id,
  });

  req.chat.latestMessage = message;

  await req.chat.save({
    validateModifiedOnly: true,
  });

  await Message.populate(message, {
    path: "chat",
    populate: {
      path: "users",
      model: "User",
      select: "name photo email",
    },
  });

  await Message.populate(message, {
    path: "sender",
    select: "name photo",
  });

  return res.status(200).json({
    status: "success",
    data: {
      message,
    },
  });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const { chat } = req;

  await Chat.populate(chat, {
    path: "messages",
    populate: {
      path: "sender",
      select: "name photo email",
    },
  });

  return res.status(200).json({
    status: "success",
    data: {
      chat,
    },
  });
});
