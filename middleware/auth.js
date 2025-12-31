function requireAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") return next();
  return res.redirect("/auth/login?msg=Please%20log%20in");
}

function exposeUser(req, res, next) {
  res.locals.user = req.session.user || null;
  next();
}

module.exports = { requireAdmin, exposeUser };
