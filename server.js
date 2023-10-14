/* eslint-disable no-console */
/* eslint-disable global-require */
const { createServer } = require("http");

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

dotenv.config({
  path: "./config.env",
});

const app = require("./app");
const {
  onSetup,
  joinChat,
  newMessageRecieved,
  typing,
  stoppedTyping,
} = require("./controllers/socketController");

const DATABASE_URI = process.env.DATABASE_URI.replace(
  "<password>",
  process.env.DATABASE_PASSWORD,
);

(async () => {
  await mongoose.connect(DATABASE_URI);

  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    // Listening for the setup event to emitted by the
    // client with the userData.
    socket.on("setup", onSetup(socket));

    socket.on("join chat", joinChat(socket));

    socket.on("new message", newMessageRecieved(socket));

    socket.on("typing", typing(socket));

    socket.on("stopped typing", stoppedTyping(socket));

    socket.on("off", () => {
      socket._cleanup();
      socket.disconnect();
    });
  });

  httpServer.listen(process.env.PORT, process.env.IP, () => {
    // eslint-disable-next-line no-console
    console.log(`App Listening At port ${process.env.PORT}`);
  });
})();
