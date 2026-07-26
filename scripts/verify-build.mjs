/**
 * Production build check that does NOT touch `.next` (used by next dev).
 * Writes to a temporary dist dir and deletes it after a successful build.
 */
import { existsSync, rmSync } from "fs";
import { spawnSync } from "child_process";

const CHECK_DIR = ".next-check";

process.env.BUILD_DIST_DIR = CHECK_DIR;

const result = spawnSync("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BUILD_DIST_DIR: CHECK_DIR },
});

if (existsSync(CHECK_DIR)) {
  rmSync(CHECK_DIR, { recursive: true, force: true });
}

process.exit(result.status === 0 ? 0 : result.status ?? 1);
