const express = require("express");
const multer = require("multer");

const { api } = require("./api");
const { BRANDS, BRAND_LOGOS } = require("./brands");
const { PARTNER_LOGOS } = require("./partners");
const reviews = require("./reviews");
const { requireAdmin } = require("./middleware/auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function homeMeta(lang) {
  return lang === "en"
    ? {
        title: "Sell Your Old Tractor in Rajasthan | Shree Krishna Yadav Tractors, Jaipur",
        description:
          "Got an old tractor sitting idle? Shree Krishna Yadav Tractors buys tractors of every brand and condition across Jaipur, Sikar, Ajmer and Alwar — free on-site inspection, a fair offer within 24 hours, no broker, no deductions. We also help with insurance, RTO transfer and finance. Fill the form and get a call today.",
      }
    : {
        title: "पुराना ट्रैक्टर बेचें राजस्थान में | श्री कृष्णा यादव ट्रैक्टर्स, जयपुर",
        description:
          "घर में पुराना ट्रैक्टर खाली पड़ा है? श्री कृष्णा यादव ट्रैक्टर्स जयपुर, सीकर, अजमेर और अलवर में हर ब्रांड और हर हालत का ट्रैक्टर खरीदता है — मुफ्त निरीक्षण, 24 घंटे में सही ऑफर, बिना दलाल। बीमा, आरटीओ ट्रांसफर और फाइनेंस में भी मदद करते हैं। आज ही फॉर्म भरें और कॉल पाएं।",
      };
}

function sellMeta(lang) {
  return lang === "en"
    ? {
        title: "Sell Your Old Tractor Online — Get The Best Price | Shree Krishna Yadav Tractors",
        description:
          "Sell your old tractor to Shree Krishna Yadav Tractors: free on-site inspection, a fair offer within 24 hours, and direct payment with no middleman. Serving farmers across Rajasthan — fill the form to get started.",
      }
    : {
        title: "पुराना ट्रैक्टर बेचें, सही कीमत पाएं | श्री कृष्णा यादव ट्रैक्टर्स",
        description:
          "अपना पुराना ट्रैक्टर श्री कृष्णा यादव ट्रैक्टर्स को बेचें — मुफ्त निरीक्षण, 24 घंटे में सही ऑफर, बिना दलाल सीधा भुगतान। राजस्थान भर में सेवा — अभी फॉर्म भरें।",
      };
}

// All page (HTML) routes. Relies on `res.locals` (siteUrl, t, lang, ...)
// already being set by the shared locals middleware in the root server.js.
module.exports = function frontendRoutes() {
  const router = express.Router();

  router.get("/", (req, res) => {
    res.render("home", {
      ...homeMeta(res.locals.lang),
      canonical: `${res.locals.siteUrl}/`,
      BRANDS,
      BRAND_LOGOS,
      reviews,
      error: null,
      submitted: false,
      form: {},
    });
  });

  router.post("/", upload.single("image"), async (req, res) => {
    try {
      const formData = new FormData();
      Object.entries(req.body).forEach(([k, v]) => formData.append(k, v));
      if (req.file) {
        formData.append("image", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
      }
      await api.submitTractor(formData);
      res.render("home", {
        ...homeMeta(res.locals.lang),
        canonical: `${res.locals.siteUrl}/`,
        BRANDS,
        BRAND_LOGOS,
        reviews,
        error: null,
        submitted: true,
        form: {},
      });
    } catch (err) {
      res.status(400).render("home", {
        ...homeMeta(res.locals.lang),
        canonical: `${res.locals.siteUrl}/`,
        BRANDS,
        BRAND_LOGOS,
        reviews,
        error: err.message,
        submitted: false,
        form: req.body,
      });
    }
  });

  // Old link — keep working, just point at the new URL
  router.get("/sell", (req, res) => res.redirect(301, "/sell-your-tractor"));

  router.get("/sell-your-tractor", (req, res) => {
    res.render("sell", {
      ...sellMeta(res.locals.lang),
      canonical: `${res.locals.siteUrl}/sell-your-tractor`,
      BRANDS,
      reviews,
      error: null,
      submitted: false,
      form: {},
    });
  });

  router.post("/sell-your-tractor", upload.single("image"), async (req, res) => {
    try {
      const formData = new FormData();
      Object.entries(req.body).forEach(([k, v]) => formData.append(k, v));
      if (req.file) {
        formData.append("image", new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);
      }
      await api.submitTractor(formData);
      res.render("sell", {
        ...sellMeta(res.locals.lang),
        canonical: `${res.locals.siteUrl}/sell-your-tractor`,
        BRANDS,
        reviews,
        error: null,
        submitted: true,
        form: {},
      });
    } catch (err) {
      res.status(400).render("sell", {
        ...sellMeta(res.locals.lang),
        canonical: `${res.locals.siteUrl}/sell-your-tractor`,
        BRANDS,
        reviews,
        error: err.message,
        submitted: false,
        form: req.body,
      });
    }
  });

  router.get("/about", (req, res) => {
    res.render("about", {
      title: `${res.locals.t("about_eyebrow")} | ${res.locals.title}`,
      canonical: `${res.locals.siteUrl}/about`,
    });
  });

  router.get("/services", async (req, res, next) => {
    try {
      const services = await api.listServices();
      res.render("services", {
        title: `${res.locals.t("services_eyebrow")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/services`,
        services,
        PARTNER_LOGOS,
        reviews,
        error: null,
        submitted: false,
        form: {},
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/services", async (req, res, next) => {
    try {
      const services = await api.listServices();
      await api.submitContact(req.body);
      res.render("services", {
        title: `${res.locals.t("services_eyebrow")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/services`,
        services,
        PARTNER_LOGOS,
        reviews,
        error: null,
        submitted: true,
        form: {},
      });
    } catch (err) {
      try {
        const services = await api.listServices();
        res.status(400).render("services", {
          title: `${res.locals.t("services_eyebrow")} | ${res.locals.title}`,
          canonical: `${res.locals.siteUrl}/services`,
          services,
          PARTNER_LOGOS,
          reviews,
          error: err.message,
          submitted: false,
          form: req.body,
        });
      } catch (err2) {
        next(err2);
      }
    }
  });

  router.get("/terms", (req, res) => {
    res.render("terms", {
      title: `${res.locals.t("terms_title")} | ${res.locals.title}`,
      canonical: `${res.locals.siteUrl}/terms`,
    });
  });

  router.get("/contact", (req, res) => {
    res.render("contact", {
      title: `${res.locals.t("contact_eyebrow")} | ${res.locals.title}`,
      canonical: `${res.locals.siteUrl}/contact`,
      error: null,
      submitted: false,
      form: {},
    });
  });

  router.post("/contact", async (req, res) => {
    try {
      await api.submitContact(req.body);
      res.render("contact", {
        title: `${res.locals.t("contact_eyebrow")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/contact`,
        error: null,
        submitted: true,
        form: {},
      });
    } catch (err) {
      res.status(400).render("contact", {
        title: `${res.locals.t("contact_eyebrow")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/contact`,
        error: err.message,
        submitted: false,
        form: req.body,
      });
    }
  });

  router.get("/login", (req, res) => {
    res.render("login", {
      title: `${res.locals.t("login_title")} | ${res.locals.title}`,
      canonical: `${res.locals.siteUrl}/login`,
      error: null,
      next: req.query.next || "/admin/dashboard",
    });
  });

  router.post("/login", async (req, res) => {
    const { email, password, next: nextUrl } = req.body;
    try {
      const { token, user } = await api.login({ email, password });
      req.session.token = token;
      req.session.user = user;
      res.redirect(user.role === "admin" ? "/admin/dashboard" : nextUrl || "/");
    } catch (err) {
      res.status(401).render("login", {
        title: `${res.locals.t("login_title")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/login`,
        error: err.message,
        next: nextUrl || "/admin/dashboard",
      });
    }
  });

  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
  });

  router.get("/admin", requireAdmin, (req, res) => res.redirect("/admin/dashboard"));

  router.get("/admin/dashboard", requireAdmin, async (req, res, next) => {
    try {
      const listings = await api.allListings(req.session.token);
      res.render("admin", {
        title: `${res.locals.t("admin_title")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/admin/dashboard`,
        listings,
        error: null,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/dashboard/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status, offered_price } = req.body;
      await api.setStatus(req.session.token, req.params.id, {
        status,
        offered_price: offered_price ? Number(offered_price) : undefined,
      });
      res.redirect("/admin/dashboard");
    } catch (err) {
      res.redirect("/admin/dashboard");
    }
  });

  router.get("/admin/services", requireAdmin, async (req, res, next) => {
    try {
      const services = await api.listServices();
      res.render("admin-services", {
        title: `${res.locals.t("admin_services_title")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/admin/services`,
        services,
        error: null,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/services", requireAdmin, async (req, res) => {
    try {
      await api.createService(req.session.token, req.body);
    } catch (err) {
      // ignored — form re-shows current list either way
    }
    res.redirect("/admin/services");
  });

  router.post("/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      await api.updateService(req.session.token, req.params.id, req.body);
    } catch (err) {
      // ignored
    }
    res.redirect("/admin/services");
  });

  router.post("/admin/services/:id/delete", requireAdmin, async (req, res) => {
    try {
      await api.deleteService(req.session.token, req.params.id);
    } catch (err) {
      // ignored
    }
    res.redirect("/admin/services");
  });

  router.get("/admin/messages", requireAdmin, async (req, res, next) => {
    try {
      const messages = await api.allMessages(req.session.token);
      res.render("admin-messages", {
        title: `${res.locals.t("admin_messages_title")} | ${res.locals.title}`,
        canonical: `${res.locals.siteUrl}/admin/messages`,
        messages,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/admin/messages/:id/read", requireAdmin, async (req, res) => {
    try {
      await api.setMessageStatus(req.session.token, req.params.id, { status: "read" });
    } catch (err) {
      // ignored
    }
    res.redirect("/admin/messages");
  });

  // SEO: robots.txt + sitemap.xml
  router.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nSitemap: ${res.locals.siteUrl}/sitemap.xml\n`
    );
  });

  router.get("/sitemap.xml", (req, res) => {
    const urls = ["/", "/sell-your-tractor", "/about", "/services", "/contact", "/terms"];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${res.locals.siteUrl}${u}</loc></url>`).join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  return router;
};
