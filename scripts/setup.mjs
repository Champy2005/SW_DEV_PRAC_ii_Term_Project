import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const [example, target] of [
  ["apps/web/.env.example", "apps/web/.env.local"],
  ["apps/api/config/config.env.example", "apps/api/config/config.env"],
]) {
  const destination = resolve(root, target);
  if (existsSync(destination)) {
    console.log(`Kept existing ${target}`);
    continue;
  }
  const content = readFileSync(resolve(root, example), "utf8")
    .replace(/replace-with-a-[\w-]+secret[\w-]*/, randomBytes(48).toString("hex"));
  writeFileSync(destination, content);
  console.log(`Created ${target}`);
}
console.log("Ready: npm run dev:demo (temporary database) or npm run db:up && npm run db:seed && npm run dev (persistent).");
