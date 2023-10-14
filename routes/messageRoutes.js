const { Router } = require("express");
const {
  sendMessage,
  getMessages,
} = require("../controllers/messageController");
const { protect } = require("../controllers/authController");
const { checkChat } = require("../controllers/chatController");

const router = Router();

router.use(protect);

router.route("/").post(checkChat, sendMessage);
router.route("/:chatId").get(checkChat, getMessages);

module.exports = router;
