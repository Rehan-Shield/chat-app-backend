/* eslint-disable no-console */

exports.onSetup = (socket) => (userData) => {
  if (!userData) {
    socket.emit("User Invalid");
    socket.leave();
  }

  socket.join(userData._id);
  socket.emit("connected");
};

exports.joinChat = (socket) => (chatId) => {
  socket.join(chatId);
  console.log(`User has connected to ${chatId}`);
};

exports.newMessageRecieved = (socket) => (message) => {
  const { chat } = message;

  if (!chat.users || !chat.users.length)
    return console.log("Not users within the chat");

  // Go through all users of the chat and emit the
  // new message into there room.

  chat.users.forEach((user) => {
    if (user._id !== message.sender._id) {
      socket.to(user._id).emit("new message recieved", message);
    }
  });
};

exports.typing = (socket) => (chatId) => {
  // All the users connected to this room except the sender will recieve this event.
  socket.to(chatId).emit("typing", "");
};

exports.stoppedTyping = (socket) => (chatId) => {
  // All the users connected to this room except the sender will recieve this event.
  socket.to(chatId).emit("stopped typing", "");
};
