const { Router } = require("express");
const { protect, restrictToAdmin } = require("../controllers/authController");
const {
  accessChat,
  getChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  checkChat,
  removeFromGroupChat,
} = require("../controllers/chatController");

const router = Router();

router.use(protect);

router.route("/").post(accessChat).get(getChats);
router.route("/group").post(createGroupChat);

router.use(checkChat, restrictToAdmin);

router.route("/rename").post(renameGroupChat);
router.route("/groupAdd").patch(addToGroupChat);
router.route("/groupRemove").patch(removeFromGroupChat);

module.exports = router;
