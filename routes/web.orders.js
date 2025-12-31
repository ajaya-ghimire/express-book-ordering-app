const express = require("express");
const { body, validationResult } = require("express-validator");
const Book = require("../models/Book");
const Order = require("../models/Order");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Cart page
router.get("/cart", async (req, res) => {
  const itemsMap = req.session.cart.items || {};
  const ids = Object.keys(itemsMap);
  const books = ids.length ? await Book.find({ _id: { $in: ids } }).lean() : [];

  const cartItems = books.map((b) => {
    const qty = itemsMap[b._id.toString()] || 0;
    const line = Number((b.price * qty).toFixed(2));
    return { book: b, qty, line };
  });

  const subtotal = cartItems.reduce((s, x) => s + x.line, 0);
  const tax = Number((subtotal * 0.07).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  res.render("cart/show", { cartItems, subtotal, tax, total });
});

// Update cart quantities
router.post("/cart/update", async (req, res) => {
  const updates = req.body.qty || {}; // { bookId: "2", ... }
  const next = {};
  for (const [bookId, v] of Object.entries(updates)) {
    const q = parseInt(v, 10);
    if (Number.isInteger(q) && q > 0) next[bookId] = q;
  }
  req.session.cart.items = next;
  res.redirect("/cart?msg=Cart%20updated");
});

// Remove one item
router.post("/cart/remove/:id", async (req, res) => {
  delete req.session.cart.items[req.params.id];
  res.redirect("/cart?msg=Removed");
});

// Checkout page = same cart view (you can split if you want)
router.post(
  "/checkout",
  body("customerName").trim().notEmpty().withMessage("Customer name required."),
  body("customerEmail").optional({ checkFalsy: true }).isEmail().withMessage("Invalid email."),
  async (req, res) => {
    const itemsMap = req.session.cart.items || {};
    const ids = Object.keys(itemsMap);
    if (!ids.length) return res.redirect("/cart?msg=Cart%20is%20empty");

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.redirect("/cart?msg=Checkout%20failed%20-%20missing%20info");
    }

    // Load books fresh to validate stock
    const books = await Book.find({ _id: { $in: ids } });
    const byId = new Map(books.map((b) => [b._id.toString(), b]));

    // Build items & validate stock
    const items = [];
    for (const id of ids) {
      const book = byId.get(id);
      if (!book) return res.redirect("/cart?msg=Book%20missing");
      const qty = itemsMap[id];

      if (qty > book.stock) {
        return res.redirect(`/cart?msg=Not%20enough%20stock%20for%20${encodeURIComponent(book.title)}`);
      }

      items.push({
        book: book._id,
        titleSnapshot: book.title,
        unitPriceSnapshot: book.price,
        quantity: qty
      });
    }

    const subtotal = items.reduce((s, it) => s + it.unitPriceSnapshot * it.quantity, 0);
    const tax = Number((subtotal * 0.07).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    // Decrement stock atomically-ish (simple approach)
    for (const it of items) {
      await Book.updateOne(
        { _id: it.book, stock: { $gte: it.quantity } },
        { $inc: { stock: -it.quantity } }
      );
    }

    const order = await Order.create({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail || "",
      items,
      subtotal: Number(subtotal.toFixed(2)),
      tax,
      total,
      status: "paid"
    });

    req.session.cart.items = {};
    res.redirect(`/orders/${order._id}?msg=Order%20placed`);
  }
);

// Orders list (admin)
router.get("/", requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.render("orders/index", { orders });
});

// Order detail (admin)
router.get("/:id", requireAdmin, async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.book").lean();
  if (!order) return res.status(404).render("404");
  res.render("orders/show", { order });
});

module.exports = router;
