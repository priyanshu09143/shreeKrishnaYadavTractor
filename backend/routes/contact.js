const express = require("express");
const { ObjectId, serialize } = require("../../config/db");
const { requireAdmin } = require("../middleware/auth");

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

module.exports = function contactRoutes(db) {
  const router = express.Router();
  const messages = () => db.collection("contact_messages");

  router.post("/", async (req, res) => {
    const { name, phone, email, message, service } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }
    const doc = {
      name,
      phone,
      email: email || "",
      service: service || "",
      message: message || "",
      status: "new",
      created_at: new Date().toISOString(),
    };
    const result = await messages().insertOne(doc);
    res.json(serialize({ ...doc, _id: result.insertedId }));
  });

  router.get("/admin/all", requireAdmin, async (req, res) => {
    const rows = await messages().find({}).sort({ created_at: -1 }).toArray();
    res.json(rows.map(serialize));
  });

  router.patch("/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!["new", "read"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const oid = toObjectId(req.params.id);
    if (!oid) return res.status(404).json({ error: "Not found" });
    const result = await messages().findOneAndUpdate({ _id: oid }, { $set: { status } }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(serialize(result));
  });

  return router;
};
