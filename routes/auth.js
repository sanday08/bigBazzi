const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  // forgotPassword,
  // resetPassword,
  updateDetails,
  updatePassword,
  getTransactions,
  getUserName,
  getUser
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.post("/", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/transactions", protect, getTransactions);
router.route("/user/:id").get(getUser)
router.route("/me").get(protect, getMe);
router.put("updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.get("/userName", protect, getUserName);
module.exports = router;