const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

// GET /api/isbn/:isbn
router.get("/:isbn", async (req, res) => {
  const isbn = String(req.params.isbn || "").trim();
  if (!isbn) return res.status(400).json({ ok: false, error: "ISBN required" });

  const url = `https://openlibrary.org/isbn/${encodeURIComponent(isbn)}.json`;
  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(404).json({ ok: false, error: "ISBN not found" });
    const data = await r.json();

    // best-effort parsing
    const title = data.title || "";
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(isbn)}-L.jpg`;

    res.json({ ok: true, data: { isbn, title, coverUrl } });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Lookup failed" });
  }
});

module.exports = router;
