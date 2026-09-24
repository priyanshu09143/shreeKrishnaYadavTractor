const bcrypt = require("bcryptjs");

async function seed(db) {
  const users = db.collection("users");
  const adminEmail = process.env.ADMIN_EMAIL || "shreekrishnayadav@gmail.com";
  const existingAdmin = await users.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "Admin@123", 10);
    await users.insertOne({
      name: "Admin",
      email: adminEmail,
      password: hash,
      role: "admin",
      created_at: new Date().toISOString(),
    });
  }

  const services = db.collection("services");
  const serviceCount = await services.countDocuments();
  if (serviceCount === 0) {
    await services.insertMany([
      {
        title_hi: "बीमा (Insurance)",
        title_en: "Insurance",
        description_hi: "ट्रैक्टर बेचने या खरीदने से पहले बीमा ट्रांसफर और क्लेम में पूरी मदद।",
        description_en: "Full support with insurance transfer and claims when you buy or sell a tractor.",
        icon: "shieldCheck",
        sort_order: 1,
        created_at: new Date().toISOString(),
      },
      {
        title_hi: "आरटीओ ट्रांसफर (RTO)",
        title_en: "RTO Transfer",
        description_hi: "मालिकाना हक ट्रांसफर और सभी आरटीओ कागजी कार्रवाई हम पूरी करते हैं।",
        description_en: "We handle ownership transfer and all RTO paperwork for you, start to finish.",
        icon: "badgeCheck",
        sort_order: 2,
        created_at: new Date().toISOString(),
      },
      {
        title_hi: "फाइनेंस (Finance)",
        title_en: "Finance",
        description_hi: "नया या पुराना ट्रैक्टर खरीदने के लिए आसान लोन और फाइनेंस की सुविधा।",
        description_en: "Easy loan and finance options to help you buy a new or used tractor.",
        icon: "rupee",
        sort_order: 3,
        created_at: new Date().toISOString(),
      },
    ]);
  }
}

module.exports = { seed };
