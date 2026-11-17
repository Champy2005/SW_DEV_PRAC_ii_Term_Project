const { test } = require("node:test");
const assert = require("node:assert/strict");

// node --test runs each file in its own process, so these settings stay here.
process.env.NODE_ENV = "production";
process.env.RATE_LIMIT_MAX = "3";

const request = require("supertest");
const { app } = require("../app");

test("a production deployment can size the shared rate limit", async () => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await request(app).get("/health");
    assert.equal(response.status, 200, `request ${attempt} should pass`);
  }

  const limited = await request(app).get("/health");
  assert.equal(limited.status, 429);
  assert.deepEqual(limited.body, {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  });
});
