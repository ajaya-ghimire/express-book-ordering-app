const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

router.get("/login", (req, res) => res.render("auth/login"));

router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 1 }).withMessage("Password required."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("auth/login", { errors: errors.array(), form: req.body });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.redirect("/auth/login?msg=Invalid%20credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.redirect("/auth/login?msg=Invalid%20credentials");

    req.session.user = { id: user._id.toString(), email: user.email, role: user.role };
    res.redirect("/books?msg=Logged%20in");
  }
);

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/?msg=Logged%20out"));
});

module.exports = router;
