const express = require("express");
const Book = require("../models/Book");
const Order = require("../models/Order");

const router = express.Router();

// POST /api/orders
// body: { customerName, customerEmail?, items: [{ bookId, quantity }] }
router.post("/", async (req, res) => {
  const { customerName, customerEmail, items } = req.body || {};
  if (!customerName?.trim()) return res.status(400).json({ ok: false, error: "customerName required" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ ok: false, error: "items required" });

  const ids = items.map((x) => x.bookId);
  const books = await Book.find({ _id: { $in: ids } });
  const byId = new Map(books.map((b) => [b._id.toString(), b]));

  const orderItems = [];
  for (const it of items) {
    const book = byId.get(String(it.bookId));
    const qty = parseInt(it.quantity, 10);
    if (!book) return res.status(400).json({ ok: false, error: "Invalid bookId" });
    if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ ok: false, error: "Invalid quantity" });
    if (qty > book.stock) return res.status(400).json({ ok: false, error: `Not enough stock for ${book.title}` });

    orderItems.push({
      book: book._id,
      titleSnapshot: book.title,
      unitPriceSnapshot: book.price,
      quantity: qty
    });
  }

  const subtotal = orderItems.reduce((s, x) => s + x.unitPriceSnapshot * x.quantity, 0);
  const tax = Number((subtotal * 0.07).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  for (const it of orderItems) {
    await Book.updateOne({ _id: it.book, stock: { $gte: it.quantity } }, { $inc: { stock: -it.quantity } });
  }

  const order = await Order.create({
    customerName: customerName.trim(),
    customerEmail: (customerEmail || "").trim(),
    items: orderItems,
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total,
    status: "paid"
  });

  res.status(201).json({ ok: true, data: order });
});

module.exports = router;
