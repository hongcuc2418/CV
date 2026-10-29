import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
for (const name of await readdir("public")) {
  if (!name.endsWith(".js")) continue;
  const result = spawnSync(process.execPath, ["--check", "public/" + name], {
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log("Application JavaScript syntax checks passed.");
