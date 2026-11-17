const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "integration-test-only-secret-at-least-32-characters";
process.env.JWT_EXPIRE = "1h";
process.env.JWT_COOKIE_EXPIRE = "1";
process.env.RATE_LIMIT_MAX = "1000";

const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { app } = require("../app");
const User = require("../models/User");
const Workshop = require("../models/Workshop");
const Registration = require("../models/Registration");
const { seedDemoData, DEMO_PASSWORD, SCENARIO_MEMBER_EMAIL } = require("../scripts/seed");
const { validateEnvironment } = require("../server");

let database;
let actors;
const api = request(app);
const auth = (user) => ({ Authorization: `Bearer ${user.getSignedJwtToken()}` });

function dateAt(offset = 1) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

async function workshop(overrides = {}) {
  return Workshop.create({
    name: "Integration Workshop",
    description: "A workshop for behavior checks.",
    instructor: "Test Instructor",
    workshopDate: dateAt(),
    location: "Test Studio",
    capacity: 10,
    ...overrides,
  });
}

const register = (user, target, extra = {}) => api.post("/api/v1/registrations")
  .set(auth(user)).send({ workshop: target.id, ...extra });

before(async () => {
  database = await MongoMemoryServer.create();
  process.env.MONGO_URI = database.getUri();
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.init(), Workshop.init(), Registration.init()]);
});

after(async () => {
  await mongoose.disconnect();
  if (database) await database.stop();
});

beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Workshop.deleteMany({}), Registration.deleteMany({})]);
  const users = await User.create([
    { name: "Administrator", email: "admin@test.local", tel: "0800000001", role: "admin", password: "TestPassword123!" },
    { name: "Member", email: "member@test.local", tel: "0800000002", role: "member", password: "TestPassword123!" },
    { name: "Other Member", email: "other@test.local", tel: "0800000003", role: "member", password: "TestPassword123!" },
  ]);
  actors = { admin: users[0], member: users[1], other: users[2] };
});

test("public discovery searches active workshops and protects account data", async () => {
  const visible = await workshop({ name: "Accessible React" });
  await workshop({ name: "Archived React", isActive: false });
  const result = await api.get("/api/v1/workshops?search=REACT").expect(200);
  assert.equal(result.body.count, 1);
  assert.equal(result.body.data[0]._id, visible.id);
  await api.get(`/api/v1/workshops/${visible.id}`).expect(200);
  await api.get("/api/v1/registrations").expect(401);
  await api.get("/api/v1/auth/me").expect(401);
});

test("signup and login return usable JWTs and omit password hashes from profiles", async () => {
  const signup = await api.post("/api/v1/auth/register").send({
    name: "New Member", email: "new@test.local", tel: "0812345678", password: "NewPassword123!", role: "member",
  }).expect(201);
  assert.equal(signup.body.data.role, "member");
  assert.equal(typeof signup.body.data.token, "string");
  await api.post("/api/v1/auth/login").send({ email: "new@test.local", password: "incorrect" }).expect(401);
  const login = await api.post("/api/v1/auth/login").send({ email: "new@test.local", password: "NewPassword123!" }).expect(200);
  const headers = { Authorization: `Bearer ${login.body.data.token}` };
  const profile = await api.get("/api/v1/auth/me").set(headers).expect(200);
  assert.equal(profile.body.data.email, "new@test.local");
  assert.equal(profile.body.data.password, undefined);
  await api.get("/api/v1/auth/logout").set(headers).expect(200);
  await api.get("/api/v1/auth/me").set("Authorization", "Bearer invalid-token").expect(401);
});

test("only admins can create, edit, or delete workshops", async () => {
  const payload = { name: "Created through API", description: "A real API mutation.", instructor: "Instructor", workshopDate: dateAt().toISOString().slice(0, 10), location: "Room 1", capacity: 4 };
  await api.post("/api/v1/workshops").send(payload).expect(401);
  await api.post("/api/v1/workshops").set(auth(actors.member)).send(payload).expect(403);
  const created = await api.post("/api/v1/workshops").set(auth(actors.admin)).send(payload).expect(201);
  const id = created.body.data._id;
  await api.put(`/api/v1/workshops/${id}`).set(auth(actors.member)).send({ location: "Changed" }).expect(403);
  await api.delete(`/api/v1/workshops/${id}`).set(auth(actors.member)).expect(403);
  const edited = await api.put(`/api/v1/workshops/${id}`).set(auth(actors.admin)).send({ location: "Room 2" }).expect(200);
  assert.equal(edited.body.data.location, "Room 2");
  await api.delete(`/api/v1/workshops/${id}`).set(auth(actors.admin)).expect(200);
});

test("only members can register and request bodies cannot forge ownership", async () => {
  const target = await workshop();
  await register(actors.admin, target).expect(403);
  const created = await register(actors.member, target, { user: actors.other.id }).expect(201);
  assert.equal(created.body.data.user._id, actors.member.id);
});

test("members see and mutate their own registrations while admins manage all", async () => {
  const target = await workshop();
  const created = await register(actors.member, target).expect(201);
  const id = created.body.data._id;
  const otherList = await api.get("/api/v1/registrations").set(auth(actors.other)).expect(200);
  assert.equal(otherList.body.count, 0);
  await api.get(`/api/v1/registrations/${id}`).set(auth(actors.other)).expect(403);
  await api.put(`/api/v1/registrations/${id}`).set(auth(actors.other)).send({ workshop: target.id }).expect(403);
  await api.delete(`/api/v1/registrations/${id}`).set(auth(actors.other)).expect(403);
  const adminList = await api.get("/api/v1/registrations").set(auth(actors.admin)).expect(200);
  assert.equal(adminList.body.count, 1);
  await api.get(`/api/v1/registrations/${id}`).set(auth(actors.admin)).expect(200);
  await api.put(`/api/v1/registrations/${id}`).set(auth(actors.admin)).send({ workshop: target.id }).expect(200);
  await api.delete(`/api/v1/registrations/${id}`).set(auth(actors.admin)).expect(200);
  assert.equal(await Registration.countDocuments({}), 0);
});

test("duplicate registrations fail, including simultaneous requests", async () => {
  const target = await workshop();
  const responses = await Promise.all([register(actors.member, target), register(actors.member, target)]);
  assert.deepEqual(responses.map((result) => result.status).sort(), [201, 409]);
  await register(actors.member, target).expect(409);
  assert.equal(await Registration.countDocuments({ user: actors.member.id, workshop: target.id }), 1);
});

test("one available seat can be claimed by only one of two simultaneous members", async () => {
  const target = await workshop({ capacity: 1 });
  const responses = await Promise.all([register(actors.member, target), register(actors.other, target)]);
  assert.deepEqual(responses.map((result) => result.status).sort(), [201, 409]);
  assert.equal(await Registration.countDocuments({ workshop: target.id }), 1);
});

test("a member can hold three active registrations; past and inactive history does not count", async () => {
  for (const overrides of [{ workshopDate: dateAt(-1) }, { isActive: false }]) {
    const history = await workshop(overrides);
    await Registration.create({ user: actors.member.id, workshop: history.id });
  }
  const targets = await Promise.all([workshop(), workshop(), workshop(), workshop()]);
  for (const target of targets.slice(0, 3)) await register(actors.member, target).expect(201);
  const rejected = await register(actors.member, targets[3]).expect(409);
  assert.match(rejected.body.error, /at most 3/);
});

test("registration date rules allow today, reject the past, and reject inactive workshops", async () => {
  const past = await workshop({ workshopDate: dateAt(-1) });
  const inactive = await workshop({ isActive: false });
  const today = await workshop({ workshopDate: dateAt(0) });
  await register(actors.member, past).expect(400);
  await register(actors.member, inactive).expect(404);
  await register(actors.member, today).expect(201);
  await api.post("/api/v1/registrations").set(auth(actors.member)).send({ workshop: "invalid-id" }).expect(400);
});

test("workshop writes validate real dates and positive integer capacity", async () => {
  const valid = { name: "Validation", description: "Validation checks.", instructor: "Instructor", location: "Studio", workshopDate: dateAt().toISOString().slice(0, 10), capacity: 5 };
  const invalid = [
    { workshopDate: "not-a-date" },
    { workshopDate: `${new Date().getUTCFullYear() + 1}-02-30` },
    { workshopDate: dateAt(-1).toISOString().slice(0, 10) },
    { capacity: 0 },
    { capacity: 1.5 },
    { capacity: "5" },
  ];
  for (const override of invalid) {
    await api.post("/api/v1/workshops").set(auth(actors.admin)).send({ ...valid, ...override }).expect(400);
  }
  assert.equal(await Workshop.countDocuments({}), 0);
});

test("editing a registration excludes itself from limits, preserves its ID, and releases the previous seat", async () => {
  const targets = await Promise.all([workshop({ capacity: 1 }), workshop(), workshop(), workshop()]);
  const registrations = [];
  for (const target of targets.slice(0, 3)) {
    const result = await register(actors.member, target).expect(201);
    registrations.push(result.body.data);
  }
  const id = registrations[0]._id;
  await api.put(`/api/v1/registrations/${id}`).set(auth(actors.member)).send({ workshop: targets[0].id }).expect(200);
  const moved = await api.put(`/api/v1/registrations/${id}`).set(auth(actors.member)).send({ workshop: targets[3].id, user: actors.other.id }).expect(200);
  assert.equal(moved.body.data._id, id);
  assert.equal(moved.body.data.user._id, actors.member.id);
  assert.equal(moved.body.data.workshop._id, targets[3].id);
  await register(actors.other, targets[0]).expect(201);
  await api.put(`/api/v1/registrations/${id}`).set(auth(actors.member)).send({ workshop: targets[1].id }).expect(409);
  await api.put(`/api/v1/registrations/${id}`).set(auth(actors.member)).send({ workshop: targets[0].id }).expect(409);
});

test("cancelling a registration releases its seat", async () => {
  const target = await workshop({ capacity: 1 });
  const created = await register(actors.member, target).expect(201);
  await register(actors.other, target).expect(409);
  await api.delete(`/api/v1/registrations/${created.body.data._id}`).set(auth(actors.member)).expect(200);
  await register(actors.other, target).expect(201);
});

test("soft deleting a workshop hides it, retains registration history, and releases the active slot", async () => {
  const targets = await Promise.all([workshop(), workshop(), workshop(), workshop()]);
  let historyId;
  for (const target of targets.slice(0, 3)) {
    const created = await register(actors.member, target).expect(201);
    if (!historyId) historyId = created.body.data._id;
  }
  await api.delete(`/api/v1/workshops/${targets[0].id}`).set(auth(actors.admin)).expect(200);
  await api.get(`/api/v1/workshops/${targets[0].id}`).expect(404);
  const stored = await Workshop.findById(targets[0].id);
  assert.equal(stored.isActive, false);
  const history = await api.get(`/api/v1/registrations/${historyId}`).set(auth(actors.member)).expect(200);
  assert.equal(history.body.data.workshop.isActive, false);
  await register(actors.member, targets[3]).expect(201);
  await api.delete(`/api/v1/registrations/${historyId}`).set(auth(actors.member)).expect(200);
});

test("admins cannot reduce capacity below current registrations or reactivate a fourth active registration", async () => {
  const active = await Promise.all([workshop(), workshop(), workshop()]);
  for (const target of active) await register(actors.member, target).expect(201);
  await register(actors.other, active[0]).expect(201);
  await api.put(`/api/v1/workshops/${active[0].id}`).set(auth(actors.admin)).send({ capacity: 1 }).expect(409);
  const past = await workshop({ workshopDate: dateAt(-1) });
  await Registration.create({ workshop: past.id, user: actors.member.id });
  await api.put(`/api/v1/workshops/${past.id}`).set(auth(actors.admin)).send({ workshopDate: dateAt(4).toISOString().slice(0, 10) }).expect(409);
});

test("demo seeding is idempotent and preserves existing data and passwords", async () => {
  const unrelated = await workshop({ name: "Keep this workshop" });
  const now = dateAt(0);
  const seeded = await seedDemoData({ now });
  assert.equal(seeded.workshops.length, 6);
  const member = await User.findById(seeded.users.member.id).select("+password");
  assert.equal(await member.matchPassword(DEMO_PASSWORD), true);
  assert.equal(seeded.workshops[0].workshopDate.toISOString().slice(0, 10), dateAt(7).toISOString().slice(0, 10));
  await Workshop.updateOne({ _id: seeded.workshops[0].id }, { $set: { name: "Edited by admin" } });
  const repeated = await seedDemoData({ now: dateAt(2), memberPassword: "ThisMustNotResetThePassword" });
  const unchangedMember = await User.findById(repeated.users.member.id).select("+password");
  assert.equal(await unchangedMember.matchPassword(DEMO_PASSWORD), true);
  assert.equal(repeated.workshops[0].name, "Edited by admin");
  assert.equal(await Workshop.countDocuments({}), 7);
  assert.ok(await Workshop.findById(unrelated.id));
  assert.equal(await User.countDocuments({}), 5);
});

test("demo scenario seed sets up each rule boundary and is repeatable", async () => {
  const seeded = await seedDemoData({ scenarios: true });
  const login = async (email) => {
    const response = await api.post("/api/v1/auth/login").send({ email, password: DEMO_PASSWORD }).expect(200);
    return { Authorization: `Bearer ${response.body.data.token}` };
  };
  const member = await login("member@workshop.local");
  const second = await login(SCENARIO_MEMBER_EMAIL);
  const byName = (name) => seeded.workshops.find((item) => item.name === name);

  // Demo member: two active registrations plus one past (history) registration.
  const own = await api.get("/api/v1/registrations").set(member).expect(200);
  assert.equal(own.body.count, 3);
  // C02: the one-seat workshop is already taken by the second member.
  const full = await api.post("/api/v1/registrations").set(member).send({ workshop: byName("Pottery Taster: One Seat").id }).expect(409);
  assert.match(full.body.error, /capacity/i);
  // C05: the past workshop is visible but cannot be registered for.
  await api.get(`/api/v1/workshops/${byName("Sunset Watercolour").id}`).expect(200);
  const past = await api.post("/api/v1/registrations").set(second).send({ workshop: byName("Sunset Watercolour").id }).expect(400);
  assert.match(past.body.error, /after the workshop date/i);
  // C04: past history does not count, so a third active registration succeeds and a fourth is refused.
  await api.post("/api/v1/registrations").set(member).send({ workshop: byName("Design Systems in Practice").id }).expect(201);
  const fourth = await api.post("/api/v1/registrations").set(member).send({ workshop: byName("Testing with Confidence").id }).expect(409);
  assert.match(fourth.body.error, /at most 3/i);

  await seedDemoData({ scenarios: true });
  assert.equal(await Registration.countDocuments({}), 5);
  assert.equal(await Workshop.countDocuments({}), 8);
});

test("server startup refuses missing Mongo configuration before opening a listener", () => {
  const original = process.env.MONGO_URI;
  try {
    delete process.env.MONGO_URI;
    assert.throws(validateEnvironment, /MONGO_URI is required/);
  } finally {
    process.env.MONGO_URI = original;
  }
});
