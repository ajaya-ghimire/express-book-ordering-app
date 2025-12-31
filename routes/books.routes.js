const express = require("express");
const { v4: uuid } = require("uuid");
const { readJson, writeJson } = require("../services/store");

const router = express.Router();
const BOOKS_FILE = "data/books.json";

// GET /books?search=
router.get("/", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const search = (req.query.search || "").trim().toLowerCase();

  const filtered = !search
    ? books
    : books.filter((b) =>
        [b.title, b.author, b.isbn].some((x) =>
          String(x).toLowerCase().includes(search)
        )
      );

  res.render("books/index", { books: filtered, search });
});

// GET /books/new
router.get("/new", (req, res) => {
  res.render("books/new");
});

// POST /books
router.post("/", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const { title, author, isbn, price, stock } = req.body;

  const errors = [];
  if (!title?.trim()) errors.push("Title is required.");
  if (!author?.trim()) errors.push("Author is required.");
  if (!isbn?.trim()) errors.push("ISBN is required.");
  if (Number.isNaN(Number(price)) || Number(price) < 0) errors.push("Price must be a valid number.");
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) errors.push("Stock must be a whole number.");

  if (errors.length) {
    return res.status(400).render("books/new", {
      errors,
      form: { title, author, isbn, price, stock }
    });
  }

  const book = {
    id: uuid(),
    title: title.trim(),
    author: author.trim(),
    isbn: isbn.trim(),
    price: Number(price),
    stock: Number(stock)
  };

  books.push(book);
  writeJson(BOOKS_FILE, books);

  res.redirect(`/books/${book.id}?msg=Book%20created`);
});

// GET /books/:id
router.get("/:id", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const book = books.find((b) => b.id === req.params.id);
  if (!book) return res.status(404).render("404");
  res.render("books/show", { book });
});

// GET /books/:id/edit
router.get("/:id/edit", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const book = books.find((b) => b.id === req.params.id);
  if (!book) return res.status(404).render("404");
  res.render("books/edit", { book });
});

// PUT /books/:id
router.put("/:id", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const idx = books.findIndex((b) => b.id === req.params.id);
  if (idx === -1) return res.status(404).render("404");

  const { title, author, isbn, price, stock } = req.body;

  const errors = [];
  if (!title?.trim()) errors.push("Title is required.");
  if (!author?.trim()) errors.push("Author is required.");
  if (!isbn?.trim()) errors.push("ISBN is required.");
  if (Number.isNaN(Number(price)) || Number(price) < 0) errors.push("Price must be a valid number.");
  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) errors.push("Stock must be a whole number.");

  if (errors.length) {
    return res.status(400).render("books/edit", {
      errors,
      book: { ...books[idx], title, author, isbn, price, stock }
    });
  }

  books[idx] = {
    ...books[idx],
    title: title.trim(),
    author: author.trim(),
    isbn: isbn.trim(),
    price: Number(price),
    stock: Number(stock)
  };

  writeJson(BOOKS_FILE, books);
  res.redirect(`/books/${req.params.id}?msg=Book%20updated`);
});

// DELETE /books/:id
router.delete("/:id", (req, res) => {
  const books = readJson(BOOKS_FILE);
  const next = books.filter((b) => b.id !== req.params.id);
  writeJson(BOOKS_FILE, next);
  res.redirect("/books?msg=Book%20deleted");
});

module.exports = router;
