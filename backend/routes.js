const path = require("path");
const express = require("express");

const authRoutes = require("./routes/auth");
const tractorRoutes = require("./routes/tractors");
const serviceRoutes = require("./routes/services");
const contactRoutes = require("./routes/contact");

// Registers every backend (API) route directly onto the shared Express app —
// the root server.js owns the single app instance and Mongo connection;
// this module only knows about its own routes and the `db` handle it's given.
module.exports = function registerBackendRoutes(app, db) {
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.use("/api/auth", authRoutes(db));
  app.use("/api/tractors", tractorRoutes(db));
  app.use("/api/services", serviceRoutes(db));
  app.use("/api/contact", contactRoutes(db));

  app.get("/api/health", (req, res) => res.json({ ok: true }));
};
