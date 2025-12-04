const express = require("express");
const {
  register,
  login,
  me,
  createAdmin,
} = require("../controllers/authController");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, me);

router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("admin", "super_admin"),
  (req, res) => {
    res.json({ message: "Admin content", user: req.user });
  }
);

router.post(
  "/register-admin",
  authenticate,
  authorizeRoles("super_admin"),
  createAdmin
);

module.exports = router;
