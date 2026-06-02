import { db, usersTable, servicesTable, ledgerTable, notificationsTable, settingsTable } from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const [admin] = await db
    .insert(usersTable)
    .values({
      username: "admin",
      email: "admin@sahucsc.in",
      mobile: "9876543210",
      fullName: "SAHU Admin",
      passwordHash,
      role: "admin",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  if (admin) {
    console.log("✅ Admin user created (username: admin, password: admin123)");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // Operator user
  const opHash = await bcrypt.hash("operator123", 12);
  await db.insert(usersTable).values({
    username: "operator",
    email: "operator@sahucsc.in",
    mobile: "9876543211",
    fullName: "CSC Operator",
    passwordHash: opHash,
    role: "operator",
    isActive: true,
  }).onConflictDoNothing();

  // Services
  const services = [
    { name: "PAN Card", description: "PAN card application and correction", price: "107", category: "Government ID" },
    { name: "Aadhaar Update", description: "Aadhaar card update and correction", price: "50", category: "Government ID" },
    { name: "Voter ID", description: "Voter ID card enrollment and correction", price: "0", category: "Government ID" },
    { name: "Passport Application", description: "Passport application assistance", price: "500", category: "Government ID" },
    { name: "Driving License", description: "DL application and renewal", price: "300", category: "Government ID" },
    { name: "Income Certificate", description: "Income certificate from state govt", price: "30", category: "Certificates" },
    { name: "Caste Certificate", description: "Caste certificate application", price: "30", category: "Certificates" },
    { name: "Residence Certificate", description: "Residence proof certificate", price: "30", category: "Certificates" },
    { name: "Birth Certificate", description: "Birth certificate correction/copy", price: "50", category: "Certificates" },
    { name: "Insurance Premium", description: "Life / health insurance premium payment", price: "20", category: "Insurance & Finance" },
    { name: "Loan Application", description: "Bank loan application assistance", price: "200", category: "Insurance & Finance" },
    { name: "Bank Account Opening", description: "Zero-balance savings account", price: "0", category: "Insurance & Finance" },
    { name: "Electricity Bill", description: "Electricity bill payment", price: "10", category: "Utility Bills" },
    { name: "Water Bill", description: "Water supply bill payment", price: "10", category: "Utility Bills" },
    { name: "Mobile Recharge", description: "Prepaid mobile recharge", price: "5", category: "Utility Bills" },
    { name: "DTH Recharge", description: "DTH / cable TV recharge", price: "10", category: "Utility Bills" },
    { name: "PMKVY Enrollment", description: "Skill training enrollment", price: "0", category: "Government Schemes" },
    { name: "PM Kisan", description: "PM Kisan beneficiary registration", price: "0", category: "Government Schemes" },
    { name: "Ayushman Bharat", description: "Health card registration", price: "30", category: "Government Schemes" },
    { name: "Photo Print", description: "Passport size photo printing", price: "30", category: "Other Services" },
    { name: "Photocopy", description: "Document photocopying", price: "2", category: "Other Services" },
    { name: "Scanning", description: "Document scanning", price: "10", category: "Other Services" },
  ];

  for (const s of services) {
    await db.insert(servicesTable).values({ ...s, isActive: true }).onConflictDoNothing();
  }
  console.log("✅ Services seeded");

  // Get admin ID for ledger entries
  const [adminUser] = await db.select().from(usersTable).limit(1);
  if (!adminUser) { console.log("❌ No admin user found"); return; }

  // Sample ledger entries for the last 30 days
  const today = new Date();
  let runningBalance = 0;
  const sampleServices = ["PAN Card", "Aadhaar Update", "Electricity Bill", "Mobile Recharge", "Income Certificate", "Photo Print"];

  const entries = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const txCount = Math.floor(Math.random() * 5) + 1;

    for (let j = 0; j < txCount; j++) {
      const serviceType = sampleServices[Math.floor(Math.random() * sampleServices.length)];
      const credit = Math.floor(Math.random() * 300) + 20;
      runningBalance += credit;
      entries.push({
        date: dateStr,
        customerName: `Customer ${Math.floor(Math.random() * 100) + 1}`,
        serviceType,
        credit: String(credit),
        debit: "0",
        description: `${serviceType} service`,
        balance: String(runningBalance),
        createdBy: adminUser.id,
      });
    }

    // Occasional expense
    if (i % 7 === 0) {
      const debit = Math.floor(Math.random() * 500) + 100;
      runningBalance -= debit;
      entries.push({
        date: dateStr,
        customerName: "Office Expense",
        serviceType: "Other Services",
        credit: "0",
        debit: String(debit),
        description: "Office supplies / expenses",
        balance: String(runningBalance),
        createdBy: adminUser.id,
      });
    }
  }

  // Check if already seeded
  const existingCount = await db.select().from(ledgerTable).limit(1);
  if (existingCount.length === 0) {
    for (const entry of entries) {
      await db.insert(ledgerTable).values(entry);
    }
    console.log(`✅ ${entries.length} ledger entries seeded`);
  } else {
    console.log("ℹ️  Ledger already has data, skipping");
  }

  // Settings
  const defaults: Record<string, string> = {
    businessName: "SAHU CSC Center",
    businessAddress: "Village Road, Block HQ, Dist-XXX, Odisha - 000000",
    businessMobile: "9876543210",
    businessEmail: "admin@sahucsc.in",
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

  // Welcome notification
  await db.insert(notificationsTable).values({
    title: "Welcome to SAHU CSC!",
    message: "Your Common Service Center management platform is ready. Start by adding ledger entries.",
    type: "success",
    isRead: false,
  });
  console.log("✅ Welcome notification created");

  console.log("\n🎉 Seed complete!");
  console.log("   Login: admin / admin123");
}

seed().catch(console.error).finally(() => process.exit(0));
