function requireAdmin(req, res, next) {
  if (!req.session.token) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  if (req.session.user?.role !== "admin") return res.status(403).render("error", { message: "Admin access only" });
  next();
}

module.exports = { requireAdmin };
