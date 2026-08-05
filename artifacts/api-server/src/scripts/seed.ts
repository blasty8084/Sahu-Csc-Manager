import { db, usersTable, servicesTable, notificationsTable, settingsTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import { eq, inArray, or, sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ── Users (always upsert to restore default passwords) ────────────────────
  const adminPassword = process.env.ADMIN_PASSWORD;
  const operatorPassword = process.env.OPERATOR_PASSWORD;

  if (!adminPassword) {
    console.error("❌ ADMIN_PASSWORD secret is not set. Add it in Replit Secrets and re-run.");
    process.exit(1);
  }
  if (!operatorPassword) {
    console.error("❌ OPERATOR_PASSWORD secret is not set. Add it in Replit Secrets and re-run.");
    process.exit(1);
  }

  // Seed contact details — read from env vars so no personal data is hard-coded.
  // ADMIN_EMAIL — set this in Render env vars to your actual email address.
  // Falls back to RESEND_FROM sender address, then a generic placeholder.
  const adminEmail    = process.env.ADMIN_EMAIL    ?? process.env.RESEND_FROM?.match(/<([^>]+)>/)?.[1] ?? "admin@example.com";
  const adminMobile   = process.env.ADMIN_MOBILE   ?? "0000000000";
  const operatorEmail = process.env.OPERATOR_EMAIL ?? "operator@example.com";
  const operatorMobile = process.env.OPERATOR_MOBILE ?? "0000000001";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await db
    .insert(usersTable)
    .values({
      username: "admin",
      email: adminEmail,
      mobile: adminMobile,
      fullName: "SAHU Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: usersTable.username,
      set: { passwordHash, isActive: true, email: adminEmail, mobile: adminMobile },
    });
  console.log("✅ Admin user created/reset (username: admin, password: from ADMIN_PASSWORD secret)");

  const opHash = await bcrypt.hash(operatorPassword, 12);
  await db
    .insert(usersTable)
    .values({
      username: "operator",
      email: operatorEmail,
      mobile: operatorMobile,
      fullName: "CSC Operator",
      passwordHash: opHash,
      role: "operator",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: usersTable.username,
      set: { passwordHash: opHash, isActive: true, email: operatorEmail, mobile: operatorMobile },
    });
  console.log("✅ Operator user created/reset (username: operator, password: from OPERATOR_PASSWORD secret)");

  // ── Services — SAHU CSC default service list ─────────────────────────────
  // Deletes all previously-seeded defaults (isDefault=true) plus legacy names
  // from older seed versions, then inserts the canonical 13-service list.
  // Custom services added by admin (isDefault=false, different names) are
  // never touched.
  const legacyDefaultNames = [
    "PAN Card", "Aadhaar Update", "Voter ID", "Passport Application", "Driving License",
    "Income Certificate", "Caste Certificate", "Residence Certificate", "Birth Certificate",
    "Insurance Premium", "Loan Application", "Bank Account Opening", "Electricity Bill",
    "Water Bill", "Mobile Recharge", "DTH Recharge", "PMKVY Enrollment", "PM Kisan",
    "Ayushman Bharat", "Photo Print", "Photocopy", "Scanning",
  ];
  await db.delete(servicesTable).where(
    or(eq(servicesTable.isDefault, true), inArray(servicesTable.name, legacyDefaultNames))
  );

  const defaultServices = [
    { name: "Income Certificate", nameHi: "आय प्रमाण पत्र", nameOr: "ଆୟ ପ୍ରମାଣ ପତ୍ର", category: "government", icon: "file-text", color: "#3B82F6", parentService: null },
    { name: "Caste Certificate", nameHi: "जाति प्रमाण पत्र", nameOr: "ଜାତି ପ୍ରମାଣ ପତ୍ର", category: "government", icon: "shield", color: "#8B5CF6", parentService: null },
    { name: "Resident Certificate", nameHi: "निवास प्रमाण पत्र", nameOr: "ବାସିନ୍ଦା ପ୍ରମାଣ ପତ୍ର", category: "government", icon: "home", color: "#10B981", parentService: null },
    { name: "Form Filling", nameHi: "फॉर्म भरना", nameOr: "ଫର୍ମ ପୂରଣ", category: "government", icon: "clipboard", color: "#F59E0B", parentService: null },
    { name: "Mobile Recharge", nameHi: "मोबाइल रिचार्ज", nameOr: "ମୋବାଇଲ ରିଚାର୍ଜ", category: "recharge", icon: "smartphone", color: "#F97316", parentService: null },
    { name: "Photo Print", nameHi: "फोटो प्रिंट", nameOr: "ଫଟୋ ପ୍ରିଣ୍ଟ", category: "print", icon: "image", color: "#EC4899", parentService: null },
    { name: "Document Print", nameHi: "दस्तावेज़ प्रिंट", nameOr: "ଡକ୍ୟୁମେଣ୍ଟ ପ୍ରିଣ୍ଟ", category: "print", icon: "printer", color: "#6366F1", parentService: null },
    { name: "PAN Card — e-PAN", nameHi: "पैन कार्ड — ई-पैन", nameOr: "ପାନ କାର୍ଡ — ଇ-ପାନ", category: "government", icon: "credit-card", color: "#0B1340", parentService: "PAN Card" },
    { name: "PAN Card — Physical", nameHi: "पैन कार्ड — फिजिकल", nameOr: "ପାନ କାର୍ଡ — ଫିଜିକାଲ", category: "government", icon: "credit-card", color: "#0B1340", parentService: "PAN Card" },
    { name: "Xerox — B/W", nameHi: "ज़ेरॉक्स — श्वेत श्याम", nameOr: "ଜେରକ୍ସ — ଧଳା କଳା", category: "print", icon: "copy", color: "#6B7280", parentService: "Xerox" },
    { name: "Xerox — Colour", nameHi: "ज़ेरॉक्स — रंगीन", nameOr: "ଜେରକ୍ସ — ରଙ୍ଗୀନ", category: "print", icon: "copy", color: "#EF4444", parentService: "Xerox" },
    { name: "Scanning", nameHi: "स्कैनिंग", nameOr: "ସ୍କ୍ୟାନିଂ", category: "print", icon: "scan", color: "#14B8A6", parentService: null },
    { name: "Ayushman Card", nameHi: "आयुष्मान कार्ड", nameOr: "ଆୟୁଷ୍ମାନ କାର୍ଡ", category: "government", icon: "heart-pulse", color: "#22C55E", parentService: null },
  ];

  await db.insert(servicesTable).values(
    defaultServices.map(s => ({ ...s, description: "", price: "0", isActive: true, isDefault: true }))
  );
  console.log("✅ Services seeded (13 default SAHU CSC services)");

  // ── Settings (skip each key if it already exists) ─────────────────────────
  // Business defaults — read from env vars so the owner can customise without editing code.
  const defaults: Record<string, string> = {
    businessName:         process.env.BUSINESS_NAME    ?? "SAHU CSC Center",
    businessAddress:      process.env.BUSINESS_ADDRESS ?? "Odisha, India",
    businessMobile:       process.env.ADMIN_MOBILE     ?? process.env.BUSINESS_MOBILE ?? "0000000000",
    businessEmail:        process.env.ADMIN_EMAIL      ?? process.env.RESEND_FROM?.match(/<([^>]+)>/)?.[1] ?? "admin@example.com",
    language: "en",
    theme: "light",
    currency: "INR",
    autoBackup: "false",
    backupFrequencyDays: "7",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await db.insert(settingsTable).values({ key, value }).onConflictDoNothing();
  }
  console.log("✅ Settings seeded");

  // ── Welcome notification (skip if already exists) ─────────────────────────
  const [existingWelcome] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(eq(notificationsTable.title, "Welcome to SAHU CSC!"));

  if ((existingWelcome?.count ?? 0) === 0) {
    await db.insert(notificationsTable).values({
      title: "Welcome to SAHU CSC!",
      message: "Your Common Service Center management platform is ready. Start by adding ledger entries.",
      type: "success",
      isRead: false,
    });
    console.log("✅ Welcome notification created");
  } else {
    console.log("ℹ️  Welcome notification already exists, skipping");
  }

  console.log("\n🎉 Seed complete!");
  console.log("   Login: admin / <ADMIN_PASSWORD> | operator / <OPERATOR_PASSWORD>");
  console.log("   (passwords are from Replit Secrets — not printed for security)");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => { console.error(err); process.exit(1); });
