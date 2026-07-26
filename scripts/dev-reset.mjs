/**
 * Stop the dev server, clear `.next`, and start a fresh `next dev`.
 * Use when CSS stops loading (unstyled page after build + refresh).
 */
import { existsSync, rmSync } from "fs";
import { execSync, spawn } from "child_process";
import { setTimeout } from "timers/promises";

function killDevServer() {
  try {
    if (process.platform === "win32") {
      const out = execSync("netstat -ano | findstr :3000 | findstr LISTENING", {
        encoding: "utf8",
      });
      const pids = new Set();
      for (const line of out.trim().split("\n")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        } catch {
          // Process may already be gone.
        }
      }
    } else {
      execSync("lsof -ti :3000 | xargs kill -9 2>/dev/null || true", {
        stdio: "ignore",
      });
    }
  } catch {
    // Nothing listening on port 3000.
  }
}

function removeNextDir() {
  if (!existsSync(".next")) return;

  try {
    rmSync(".next", {
      recursive: true,
      force: true,
      maxRetries: 8,
      retryDelay: 400,
    });
    console.log("Removed .next cache");
  } catch (err) {
    console.warn(
      "Could not fully remove .next (OneDrive may be locking files).",
      err instanceof Error ? err.message : err
    );
    console.warn("Close other dev servers, pause OneDrive sync, then run: npm run dev:clean");
  }
}

killDevServer();
await setTimeout(2000);
removeNextDir();

console.log("Starting dev server...");
spawn("next", ["dev"], { stdio: "inherit", shell: true });
