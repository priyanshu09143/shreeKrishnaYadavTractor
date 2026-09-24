const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { serialize } = require("../../config/db");

function sign(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Admin-only login. There is no public registration — sellers submit tractors
// without an account via POST /api/tractors.
module.exports = function authRoutes(db) {
  const router = express.Router();

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ email });
    if (!user || !bcrypt.compareSync(password || "", user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const { password: _pw, ...safeUser } = serialize(user);
    res.json({ token: sign(safeUser), user: safeUser });
  });

  return router;
};
