const express = require("express");
const { v4: uuid } = require("uuid");
const { readJson, writeJson } = require("../services/store");

const router = express.Router();
const BOOKS_FILE = "data/books.json";
const ORDERS_FILE = "data/orders.json";

// GET /orders
router.get("/", (req, res) => {
  const orders = readJson(ORDERS_FILE).slice().reverse();
  res.render("orders/index", { orders });
});

// GET /orders/new
router.get("/new", (req, res) => {
  const books = readJson(BOOKS_FILE);
  res.render("orders/new", { books });
});

// POST /orders
router.post("/", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const orders = readJson(ORDERS_FILE);

  const { bookId, quantity, customerName } = req.body;
  const q = Number(quantity);

  const errors = [];
  const book = books.find((b) => b.id === bookId);

  if (!customerName?.trim()) errors.push("Customer name is required.");
  if (!book) errors.push("Please select a valid book.");
  if (!Number.isInteger(q) || q <= 0) errors.push("Quantity must be a whole number greater than 0.");
  if (book && q > book.stock) errors.push(`Not enough stock. Available: ${book.stock}`);

  if (errors.length) {
    return res.status(400).render("orders/new", {
      errors,
      books,
      form: { bookId, quantity, customerName }
    });
  }

  // Reduce stock
  book.stock -= q;

  const order = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    customerName: customerName.trim(),
    bookId: book.id,
    bookTitle: book.title,
    unitPrice: book.price,
    quantity: q,
    total: Number((book.price * q).toFixed(2))
  };

  writeJson(BOOKS_FILE, books);
  orders.push(order);
  writeJson(ORDERS_FILE, orders);

  res.redirect(`/orders/${order.id}?msg=Order%20placed`);
});

// GET /orders/:id
router.get("/:id", (req, res) => {
  const orders = readJson(ORDERS_FILE);
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).render("404");
  res.render("orders/show", { order });
});

module.exports = router;
