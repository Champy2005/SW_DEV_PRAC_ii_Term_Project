require("../config/env");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Workshop = require("../models/Workshop");
const Registration = require("../models/Registration");
const connectDB = require("../config/db");

const DEMO_PASSWORD = "WorkshopDemo123!";
const DEMO_EMAILS = { admin: "admin@workshop.local", member: "member@workshop.local" };

function futureDate(now, offset) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

const workshopFixtures = [
  { name: "Build Your First React App", description: "Turn an idea into an interactive interface with components, props, state, and reusable patterns.", instructor: "Narin Chai", location: "Innovation Lab, Room 301", capacity: 24, days: 7 },
  { name: "Design Systems in Practice", description: "Create accessible interface foundations, reusable components, and a consistent visual language.", instructor: "Pim Suthida", location: "Design Studio, Room 204", capacity: 18, days: 10 },
  { name: "APIs That Work Together", description: "Explore HTTP, JSON, authentication, and practical approaches to connecting a frontend to a REST API.", instructor: "Thanawat Lee", location: "Computer Lab, Room 402", capacity: 20, days: 14 },
  { name: "Testing with Confidence", description: "Practice behavior-driven testing, automated browser checks, and useful test cases for real applications.", instructor: "Mali Wong", location: "Innovation Lab, Room 302", capacity: 16, days: 18 },
  { name: "From Prototype to Product", description: "Map a user journey, test your assumptions, and turn a promising prototype into a product people can use.", instructor: "Arun Saeng", location: "Co-working Space, Floor 2", capacity: 30, days: 21 },
  { name: "Ship Your Next.js Project", description: "Bring routing, server rendering, forms, and deployment together in a guided Next.js project workshop.", instructor: "Siri Kitt", location: "Computer Lab, Room 401", capacity: 22, days: 28 },
];

/**
 * Optional demo boundary data, so each business rule can be shown in one or two clicks:
 * - a one-seat workshop already taken by a second member (capacity, C02);
 * - a past workshop the demo member attended (past-date rule C05; history excluded from C04);
 * - two active registrations for the demo member, so the third succeeds and the fourth is refused (C04).
 * The past workshop and its registration are inserted directly because the API correctly rejects past dates.
 */
const SCENARIO_MEMBER_EMAIL = "member2@workshop.local";
const scenarioWorkshops = [
  { _id: "690100000000000000000007", name: "Pottery Taster: One Seat", description: "Shape a small bowl on the wheel in a one-to-one taster session.", instructor: "Kanya Dee", location: "Craft Room, Floor 1", capacity: 1, days: 5 },
  { _id: "690100000000000000000008", name: "Sunset Watercolour", description: "Mix colour washes and paint a simple evening landscape.", instructor: "Ploy Arun", location: "Art Room, Floor 3", capacity: 12, days: -3 },
];

/**
 * Requires an existing MongoDB connection. Inserts fixtures without changing existing records.
 * `scenarios: true` adds the demo boundary data described above (demo/test databases only).
 */
async function seedDemoData({
  now = new Date(),
  adminPassword = process.env.DEMO_ADMIN_PASSWORD || DEMO_PASSWORD,
  memberPassword = process.env.DEMO_MEMBER_PASSWORD || DEMO_PASSWORD,
  scenarios = false,
} = {}) {
  if (process.env.NODE_ENV === "production") throw new Error("Demo seeding is available only outside production.");
  if (Number.isNaN(new Date(now).getTime())) throw new Error("A valid seed date is required.");
  await Promise.all([User.init(), Workshop.init()]);
  const accounts = [
    { name: "Demo Administrator", email: DEMO_EMAILS.admin, tel: "0810000001", role: "admin", password: adminPassword },
    { name: "Demo Member", email: DEMO_EMAILS.member, tel: "0810000002", role: "member", password: memberPassword },
  ];
  const users = {};
  for (const account of accounts) {
    // findOneAndUpdate does not run the model's save hook; hash only the insert value.
    const password = await bcrypt.hash(account.password, 10);
    users[account.role] = await User.findOneAndUpdate(
      { email: account.email },
      { $setOnInsert: { ...account, password } },
      { upsert: true, new: true, runValidators: true }
    );
  }
  const workshops = [];
  for (const [index, fixture] of workshopFixtures.entries()) {
    const { days, ...fields } = fixture;
    const _id = new mongoose.Types.ObjectId(`69010000000000000000000${index + 1}`);
    const workshop = await Workshop.findOneAndUpdate(
      { _id },
      { $setOnInsert: { ...fields, workshopDate: futureDate(now, days), isActive: true, createdAt: new Date(now), updatedAt: new Date(now) } },
      { upsert: true, new: true, runValidators: true, timestamps: false }
    );
    workshops.push(workshop);
  }
  if (!scenarios) return { users, workshops };

  const scenarioPassword = await bcrypt.hash(memberPassword, 10);
  users.secondMember = await User.findOneAndUpdate(
    { email: SCENARIO_MEMBER_EMAIL },
    { $setOnInsert: { name: "Second Demo Member", email: SCENARIO_MEMBER_EMAIL, tel: "0810000003", role: "member", password: scenarioPassword } },
    { upsert: true, new: true, runValidators: true }
  );
  const extra = {};
  for (const { _id, days, ...fields } of scenarioWorkshops) {
    extra[_id] = await Workshop.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id) },
      { $setOnInsert: { ...fields, workshopDate: futureDate(now, days), isActive: true, createdAt: new Date(now), updatedAt: new Date(now) } },
      { upsert: true, new: true, runValidators: true, timestamps: false }
    );
    workshops.push(extra[_id]);
  }
  const [pottery, watercolour] = scenarioWorkshops.map((item) => extra[item._id]);
  const placements = [
    [users.secondMember, pottery],
    [users.member, watercolour],
    [users.member, workshops[0]],
    [users.member, workshops[2]],
  ];
  await Registration.init();
  for (const [user, workshop] of placements) {
    await Registration.updateOne({ user: user._id, workshop: workshop._id }, { $setOnInsert: { user: user._id, workshop: workshop._id } }, { upsert: true });
  }
  return { users, workshops };
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required. Configure config/config.env before seeding.");
  try {
    // Same connection helper as the API, including its public DNS resolvers
    // for Atlas SRV lookups (a local DNS proxy may refuse them).
    await connectDB();
    const scenarios = process.argv.includes("--scenarios");
    const result = await seedDemoData({ scenarios });
    console.log(`Demo data ready: ${Object.keys(result.users).length} accounts, ${result.workshops.length} workshops${scenarios ? " (with rule scenarios)" : ""}.`);
    console.log(`Emails: ${DEMO_EMAILS.admin}, ${DEMO_EMAILS.member}${scenarios ? `, ${SCENARIO_MEMBER_EMAIL}` : ""}`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { seedDemoData, DEMO_EMAILS, DEMO_PASSWORD, SCENARIO_MEMBER_EMAIL };
