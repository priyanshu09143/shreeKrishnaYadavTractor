require("dotenv").config();
const path = require("path");
const express = require("express");
const cookieSession = require("cookie-session");

const { getDb } = require("./config/db");
const CONTACT = require("./config/contact");
const icons = require("./utils/icons");
const { CONDITIONS, LOCATIONS, makeT } = require("./utils/i18n");

const { seed } = require("./backend/seed");
const registerBackendRoutes = require("./backend/routes");
const frontendRoutes = require("./frontend/routes");

const { IMAGE_FALLBACK, HERO_IMAGE } = require("./frontend/api");

const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

async function start() {
  const db = await getDb();
  await seed(db);

  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "frontend", "views"));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "frontend", "public")));
  app.use(
    cookieSession({
      name: "kyt_session",
      secret: process.env.COOKIE_SECRET,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
  );

  // Make user/siteUrl/language available in every view without passing explicitly
  app.use((req, res, next) => {
    const lang = req.session.lang === "en" ? "en" : "hi";
    res.locals.user = req.session.user || null;
    res.locals.siteUrl = SITE_URL;
    res.locals.currentPath = req.path;
    res.locals.lang = lang;
    res.locals.t = makeT(lang);
    res.locals.LOCATION = LOCATIONS[lang];
    res.locals.CONDITIONS = CONDITIONS;
    res.locals.title = lang === "en" ? "Shree Krishna Yadav Tractors" : "श्री कृष्णा यादव ट्रैक्टर्स";
    res.locals.description =
      lang === "en"
        ? "Sell your old tractor for a fair price — to Shree Krishna Yadav Tractors."
        : "अपना पुराना ट्रैक्टर सही दाम में बेचें — श्री कृष्णा यादव ट्रैक्टर्स को।";
    res.locals.canonical = `${SITE_URL}${req.originalUrl}`;
    res.locals.icons = icons;
    res.locals.IMAGE_FALLBACK = IMAGE_FALLBACK;
    res.locals.HERO_IMAGE = HERO_IMAGE;
    res.locals.CONTACT = CONTACT;
    next();
  });

  app.get("/lang/:code", (req, res) => {
    req.session.lang = req.params.code === "en" ? "en" : "hi";
    res.redirect(req.get("referer") || "/");
  });

  // Backend (separate codebase under backend/) registers its own routes —
  // /api/*, /uploads/* — directly on this one shared app, no sub-app.
  registerBackendRoutes(app, db);

  // Frontend (separate codebase under frontend/) registers every page route.
  app.use(frontendRoutes());

  app.use((req, res) => {
    res.status(404).render("error", { message: res.locals.t("error_not_found") });
  });

  app.use((err, req, res, next) => {
    console.error(err);
    const message =
      res.locals.lang === "en" ? "Something went wrong. Please try again." : "कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें।";
    res.status(500).render("error", { message });
  });

  app.listen(PORT, () => console.log(`Shree Krishna Yadav Tractors running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
