const express = require("express");
const multer = require("multer");
const path = require("path");
const { ObjectId, serialize } = require("../../config/db");
const { requireAdmin } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "")}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

function toObjectId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

module.exports = function tractorRoutes(db) {
  const router = express.Router();
  const tractors = () => db.collection("tractors");

  // Public: browse approved tractors for sale
  router.get("/", async (req, res) => {
    const rows = await tractors().find({ status: "approved" }).sort({ created_at: -1 }).toArray();
    res.json(rows.map(serialize));
  });

  router.get("/:id", async (req, res) => {
    const oid = toObjectId(req.params.id);
    const row = oid && (await tractors().findOne({ _id: oid }));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(serialize(row));
  });

  // Public: submit a tractor for sale — no account required, contact details are captured directly
  router.post("/", upload.single("image"), async (req, res) => {
    const {
      brand,
      model,
      year,
      hours_used,
      condition,
      asking_price,
      description,
      location,
      seller_name,
      seller_phone,
      seller_email,
    } = req.body;

    if (!brand || !model || !year || !asking_price) {
      return res.status(400).json({ error: "Brand, model, year and asking price are required" });
    }
    if (!seller_name || !seller_phone) {
      return res.status(400).json({ error: "Your name and phone number are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const doc = {
      brand,
      model,
      year: Number(year),
      hours_used: hours_used ? Number(hours_used) : null,
      condition: condition || "",
      asking_price: Number(asking_price),
      offered_price: null,
      description: description || "",
      location: location || "",
      image,
      seller_name,
      seller_phone,
      seller_email: seller_email || "",
      status: "pending",
      created_at: new Date().toISOString(),
    };
    const result = await tractors().insertOne(doc);
    res.json(serialize({ ...doc, _id: result.insertedId }));
  });

  // Admin: view all listings (any status)
  router.get("/admin/all", requireAdmin, async (req, res) => {
    const rows = await tractors().find({}).sort({ created_at: -1 }).toArray();
    res.json(rows.map(serialize));
  });

  // Admin: approve/reject/purchase a listing, optionally set the price we buy it for
  router.patch("/:id/status", requireAdmin, async (req, res) => {
    const { status, offered_price } = req.body;
    if (!["approved", "rejected", "purchased", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const oid = toObjectId(req.params.id);
    if (!oid) return res.status(404).json({ error: "Not found" });

    const update = { status };
    if (offered_price != null) update.offered_price = offered_price;
    const result = await tractors().findOneAndUpdate({ _id: oid }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(serialize(result));
  });

  return router;
};
