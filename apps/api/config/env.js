const path = require("node:path");
const dotenv = require("dotenv");

// Shell/CI variables take priority. Resolve relative to this file, not npm's cwd.
dotenv.config({ path: process.env.API_ENV_FILE || path.join(__dirname, "config.env") });
