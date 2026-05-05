const path = require("path");
const { spawnSync } = require("child_process");

process.env.CI = "false";
if (!process.env.DISABLE_ESLINT_PLUGIN) process.env.DISABLE_ESLINT_PLUGIN = "true";

const reactScriptsBin =
  process.platform === "win32"
    ? path.join(__dirname, "..", "node_modules", ".bin", "react-scripts.cmd")
    : path.join(__dirname, "..", "node_modules", ".bin", "react-scripts");

const result = spawnSync(reactScriptsBin, ["build"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);

