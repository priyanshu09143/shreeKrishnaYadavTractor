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

module.exports = function serviceRoutes(db) {
  const router = express.Router();
  const services = () => db.collection("services");

  router.get("/", async (req, res) => {
    const rows = await services().find({}).sort({ sort_order: 1, _id: 1 }).toArray();
    res.json(rows.map(serialize));
  });

  router.post("/", requireAdmin, async (req, res) => {
    const { title_hi, title_en, description_hi, description_en, icon, sort_order } = req.body;
    if (!title_hi || !title_en) {
      return res.status(400).json({ error: "Title (Hindi and English) is required" });
    }
    const doc = {
      title_hi,
      title_en,
      description_hi: description_hi || "",
      description_en: description_en || "",
      icon: icon || "wrench",
      sort_order: Number(sort_order) || 0,
      created_at: new Date().toISOString(),
    };
    const result = await services().insertOne(doc);
    res.json(serialize({ ...doc, _id: result.insertedId }));
  });

  router.patch("/:id", requireAdmin, async (req, res) => {
    const oid = toObjectId(req.params.id);
    const existing = oid && (await services().findOne({ _id: oid }));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { title_hi, title_en, description_hi, description_en, icon, sort_order } = req.body;
    const update = {
      title_hi: title_hi ?? existing.title_hi,
      title_en: title_en ?? existing.title_en,
      description_hi: description_hi ?? existing.description_hi,
      description_en: description_en ?? existing.description_en,
      icon: icon ?? existing.icon,
      sort_order: sort_order != null ? Number(sort_order) : existing.sort_order,
    };
    const result = await services().findOneAndUpdate({ _id: oid }, { $set: update }, { returnDocument: "after" });
    res.json(serialize(result));
  });

  router.delete("/:id", requireAdmin, async (req, res) => {
    const oid = toObjectId(req.params.id);
    if (!oid) return res.status(404).json({ error: "Not found" });
    const result = await services().deleteOne({ _id: oid });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  });

  return router;
};
