const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.checkChat = catchAsync(async (req, res, next) => {
  const chatId = req.body.chatId ?? req.params.chatId;

  const chat = await Chat.findById(chatId);

  if (!chat)
    return next(
      new AppError(
        "No chat corresponds to the given id please provide a valid chat id",
        400,
      ),
    );

  req.chat = chat;

  next();
});

exports.getChats = catchAsync(async (req, res, next) => {
  const chats = await Chat.find({
    users: req.user._id,
  })
    .populate("users")
    .populate("groupAdmin")
    .populate("latestMessage")
    .sort({
      updatedAt: -1,
    });

  return res.status(200).json({
    status: "success",
    data: {
      chats,
    },
  });
});

exports.createGroupChat = catchAsync(async (req, res, next) => {
  if (!req.body.users || !req.body.name) {
    return next(
      new AppError(
        "Please provide the complete details in order to create a group chat",
        400,
      ),
    );
  }
  const { users } = req.body;

  if (users.length < 2) {
    return next(
      new AppError("More than 2 users are required to form a group chat", 400),
    );
  }

  users.push(req.user._id);

  const groupChat = await Chat.create({
    name: req.body.name,
    users: users,
    isGroupChat: true,
    groupAdmin: req.user._id,
  });

  await Chat.populate(groupChat, {
    path: "users",
  });
  await Chat.populate(groupChat, {
    path: "groupAdmin",
  });

  return res.status(200).json({
    status: "success",
    data: {
      groupChat,
    },
  });
});

exports.renameGroupChat = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name)
    return next(
      new AppError("Please provide a valid new name of the chat", 400),
    );

  req.chat.name = name;

  await req.chat.save({
    validateModifiedOnly: true,
  });

  await Chat.populate(req.chat, {
    path: "users",
  });
  await Chat.populate(req.chat, {
    path: "groupAdmin",
  });

  return res.status(200).json({
    status: "success",
    data: { chat: req.chat },
  });
});

exports.addToGroupChat = catchAsync(async (req, res, next) => {
  const { userId, chatId } = req.body;

  if (req.chat.users.includes(userId))
    return next(new AppError("User already exists within the chat", 400));

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {
        users: userId,
      },
    },
    {
      new: true,
    },
  );

  await Chat.populate(updatedChat, {
    path: "users",
  });
  await Chat.populate(updatedChat, {
    path: "groupAdmin",
  });

  return res.status(200).json({
    status: "success",
    data: {
      chat: updatedChat,
    },
  });
});

exports.removeFromGroupChat = catchAsync(async (req, res, next) => {
  const { userId, chatId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        users: userId,
      },
    },
    {
      new: true,
    },
  );

  await Chat.populate(updatedChat, {
    path: "users",
  });
  await Chat.populate(updatedChat, {
    path: "groupAdmin",
  });

  return res.status(200).json({
    status: "success",
    data: {
      chat: updatedChat,
    },
  });
});

exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError("Please provide a valid user id", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(
      new AppError("A User doesnt exist with the following user id", 400),
    );
  }

  const isChat = await Chat.findOne({
    isGroupChat: false,
    users: { $size: 2, $all: [userId, req.user._id] },
  })
    .populate("users", "-__v")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        model: "User",
      },
    });

  if (isChat) {
    return res.status(200).json({
      status: "success",
      data: {
        chat: isChat,
      },
    });
  }

  const newChat = {
    name: user.name,
    users: [userId, req.user._id],
  };

  const createdChat = await Chat.create(newChat);

  const fullChat = await Chat.findOne({
    _id: createdChat._id,
  }).populate("users");

  res.status(200).json({
    status: "success",
    data: {
      chat: fullChat,
    },
  });
});
