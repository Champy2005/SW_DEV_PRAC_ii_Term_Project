require("./config/env");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

function validateEnvironment() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Copy config/config.env.example to config/config.env and configure MongoDB.");
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET.startsWith("replace-")) {
    throw new Error("JWT_SECRET must be a unique random secret of at least 32 characters.");
  }
  if (!process.env.JWT_EXPIRE || !process.env.JWT_COOKIE_EXPIRE) {
    throw new Error("JWT_EXPIRE and JWT_COOKIE_EXPIRE are required. See config/config.env.example.");
  }
}

async function startServer({ port = Number(process.env.PORT || 5000), host = "127.0.0.1" } = {}) {
  validateEnvironment();
  await connectDB();
  // Ensure the unique member/workshop index exists before serving writes.
  await Promise.all([
    require("./models/User").init(),
    require("./models/Workshop").init(),
    require("./models/Registration").init(),
  ]);
  const { app } = require("./app");
  return new Promise((resolve, reject) => {
    const server = app.listen(port, host, () => {
      console.log(`Workshop Registration API running on http://${host}:${server.address().port}`);
      resolve(server);
    });
    server.once("error", reject);
  });
}

if (require.main === module) {
  let server;
  let stopping = false;
  async function shutdown(exitCode = 0) {
    if (stopping) return;
    stopping = true;
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
    process.exitCode = exitCode;
  }
  startServer({ host: process.env.HOST || "127.0.0.1" }).then((listeningServer) => {
    server = listeningServer;
  }).catch(async (error) => {
    console.error(`API startup failed: ${error.message}`);
    await shutdown(1);
  });
  process.once("SIGINT", () => shutdown());
  process.once("SIGTERM", () => shutdown());
  process.once("unhandledRejection", async (error) => {
    console.error(`Unhandled rejection: ${error.message}`);
    await shutdown(1);
  });
}

module.exports = { startServer, validateEnvironment };
