#!/usr/bin/env node
import { createAndStartServer } from "./server.js";

try {
  await createAndStartServer();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
