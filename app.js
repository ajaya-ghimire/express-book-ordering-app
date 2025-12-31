require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const { engine } = require("express-handlebars");
const bcrypt = require("bcrypt");

const { connectDB } = require("./config/db");
const User = require("./models/User");
const { exposeUser } = require("./middleware/auth");

const webBooks = require("./routes/web.books");
const webOrders = require("./routes/web.orders");
const webAuth = require("./routes/web.auth");

const apiBooks = require("./routes/api.books");
const apiOrders = require("./routes/api.orders");
const apiIsbn = require("./routes/api.isbn");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }
  })
);

// Simple flash via query
app.use((req, res, next) => {
  res.locals.flash = req.query.msg || "";
  next();
});

app.use(exposeUser);

// Cart in session
app.use((req, res, next) => {
  if (!req.session.cart) req.session.cart = { items: {} }; // { bookId: qty }
  next();
});

app.engine(
  "hbs",
  engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
    helpers: {
      money: (n) => `$${Number(n || 0).toFixed(2)}`,
      eq: (a, b) => String(a) === String(b)
    }
  })
);
app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

// Routes
app.get("/", (req, res) => res.render("home"));
app.use("/auth", webAuth);
app.use("/books", webBooks);
app.use("/", webOrders); // so /cart, /orders, etc work


// APIs
app.use("/api/books", apiBooks);
app.use("/api/orders", apiOrders);
app.use("/api/isbn", apiIsbn);

app.use((req, res) => res.status(404).render("404"));

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email, passwordHash, role: "admin" });
  console.log("Admin user created from .env ADMIN_EMAIL/ADMIN_PASSWORD");
}

async function start() {
  await connectDB(process.env.MONGO_URI);
  await ensureAdminUser();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`http://localhost:${port}`));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
