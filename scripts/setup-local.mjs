import { copyFileSync, existsSync } from "fs";
import { execSync } from "child_process";

if (!existsSync(".env")) {
  copyFileSync(".env.example", ".env");
  console.log("Created .env from .env.example");
}

const env = {
  ...process.env,
  NODE_ENV: "development",
};

execSync("pnpm install", { stdio: "inherit", env });
execSync("pnpm db:setup", { stdio: "inherit", env });
