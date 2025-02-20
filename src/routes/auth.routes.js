const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const router = express.Router();

const VALID_CREDENTIALS = {
  username: "naval.ravikant",
  password: "05111974",
};

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate credentials
  if (!username || !password) {
    return res.status(400).json({
      error: "Username and password are required",
    });
  }

  if (
    username === VALID_CREDENTIALS.username &&
    password === VALID_CREDENTIALS.password
  ) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });

    return res.status(200).json({ JWT: token });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

module.exports = router;
