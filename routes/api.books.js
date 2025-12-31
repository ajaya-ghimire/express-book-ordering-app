const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

router.get("/", async (req, res) => {
  const search = (req.query.search || "").trim();
  const q = search
    ? { $or: [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { isbn: { $regex: search, $options: "i" } }
      ] }
    : {};
  const books = await Book.find(q).sort({ createdAt: -1 });
  res.json({ ok: true, data: books });
});

router.get("/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ ok: false, error: "Not found" });
  res.json({ ok: true, data: book });
});

module.exports = router;
