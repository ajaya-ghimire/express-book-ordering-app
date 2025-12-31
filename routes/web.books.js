const express = require("express");
const { body, validationResult } = require("express-validator");
const Book = require("../models/Book");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// list + search
router.get("/", async (req, res) => {
  const search = (req.query.search || "").trim();
  const q = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
          { isbn: { $regex: search, $options: "i" } }
        ]
      }
    : {};

  const books = await Book.find(q).sort({ createdAt: -1 }).lean();
  res.render("books/index", { books, search });
});

router.get("/new", requireAdmin, (req, res) => res.render("books/new"));

router.post(
  "/",
  requireAdmin,
  body("title").trim().notEmpty().withMessage("Title required."),
  body("author").trim().notEmpty().withMessage("Author required."),
  body("isbn").trim().notEmpty().withMessage("ISBN required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0."),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a whole number >= 0."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("books/new", { errors: errors.array(), form: req.body });
    }

    const created = await Book.create({
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      coverUrl: req.body.coverUrl || ""
    });

    res.redirect(`/books/${created._id}?msg=Book%20created`);
  }
);

router.get("/:id", async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return res.status(404).render("404");
  res.render("books/show", { book });
});

router.get("/:id/edit", requireAdmin, async (req, res) => {
  const book = await Book.findById(req.params.id).lean();
  if (!book) return res.status(404).render("404");
  res.render("books/edit", { book });
});

router.put(
  "/:id",
  requireAdmin,
  body("title").trim().notEmpty().withMessage("Title required."),
  body("author").trim().notEmpty().withMessage("Author required."),
  body("isbn").trim().notEmpty().withMessage("ISBN required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0."),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a whole number >= 0."),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const book = { _id: req.params.id, ...req.body };
      return res.status(400).render("books/edit", { errors: errors.array(), book });
    }

    await Book.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      coverUrl: req.body.coverUrl || ""
    });

    res.redirect(`/books/${req.params.id}?msg=Book%20updated`);
  }
);

router.delete("/:id", requireAdmin, async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.redirect("/books?msg=Book%20deleted");
});

// Add to cart
router.post("/:id/add-to-cart", async (req, res) => {
  const qty = Math.max(1, parseInt(req.body.quantity || "1", 10));
  const book = await Book.findById(req.params.id).lean();
  if (!book) return res.redirect("/books?msg=Book%20not%20found");

  const id = book._id.toString();
  const current = req.session.cart.items[id] || 0;
  req.session.cart.items[id] = current + qty;

  res.redirect(`/cart?msg=Added%20to%20cart`);
});

module.exports = router;
