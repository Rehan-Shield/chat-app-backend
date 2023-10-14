const { Router } = require("express");
const multer = require("multer");

const {
  signup,
  login,
  protect,
  logout,
} = require("../controllers/authController");
const { getUsers } = require("../controllers/userController");

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/").get(protect, getUsers);

router.post("/signup", upload.single("photo"), signup);

router.post("/login", login);

router.post("/logout", logout);

module.exports = router;
