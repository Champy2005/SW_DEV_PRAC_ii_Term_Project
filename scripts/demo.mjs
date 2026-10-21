import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { randomBytes } from "node:crypto";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requireApi = createRequire(resolve(root, "apps/api/package.json"));
const requireWeb = createRequire(resolve(root, "apps/web/package.json"));
const { MongoMemoryServer } = requireApi("mongodb-memory-server");
const mongoose = requireApi("mongoose");
let database;
let server;
let web;
let stopping = false;

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (web && web.exitCode === null) {
    const exited = new Promise((done) => {
      web.once("exit", done);
      const timer = setTimeout(done, 5000);
      timer.unref();
    });
    if (process.platform === "win32") {
      // Next dev owns a worker process; terminate its process tree on Windows.
      spawnSync("taskkill.exe", ["/PID", String(web.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    } else {
      web.kill("SIGTERM");
    }
    await exited;
  }
  if (server) {
    server.closeAllConnections();
    await new Promise((done) => server.close(done));
  }
  await mongoose.disconnect();
  await database?.stop();
  process.exit(code);
}
process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());

try {
  database = await MongoMemoryServer.create({
    // Keep Windows console Ctrl+C from killing mongod before its manager can
    // stop it and remove the temporary database directory.
    spawn: { detached: process.platform === "win32", windowsHide: true },
  });
  Object.assign(process.env, {
    MONGO_URI: database.getUri("workshop_demo"),
    JWT_SECRET: randomBytes(48).toString("hex"),
    JWT_EXPIRE: "1d",
    JWT_COOKIE_EXPIRE: "1",
    PORT: process.env.DEMO_API_PORT || "5000",
    NODE_ENV: "development",
    RATE_LIMIT_MAX: "10000",
  });
  const { startServer } = requireApi("./server.js");
  server = await startServer();
  const { seedDemoData } = requireApi("./scripts/seed.js");
  await seedDemoData();
  const production = process.argv.includes("--production");
  const webPort = process.env.DEMO_WEB_PORT || "3000";
  const next = requireWeb.resolve("next/dist/bin/next");
  web = spawn(process.execPath, [next, production ? "start" : "dev", "--hostname", "127.0.0.1", "--port", webPort], {
    cwd: resolve(root, "apps/web"),
    env: {
      ...process.env,
      NODE_ENV: production ? "production" : "development",
      API_URL: `http://127.0.0.1:${process.env.PORT}/api/v1`,
      COOKIE_SECURE: "false",
    },
    stdio: "inherit",
    windowsHide: true,
  });
  web.on("error", (error) => { console.error(error); void stop(1); });
  web.on("exit", (code) => { if (!stopping) void stop(code || 0); });
  console.log(`\nTemporary demo: http://127.0.0.1:${webPort}`);
  console.log("member@workshop.local or admin@workshop.local / WorkshopDemo123!");
  console.log("Data is discarded when this process stops. First run may download MongoDB.\n");
} catch (error) {
  console.error(error);
  await stop(1);
}
