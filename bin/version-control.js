#!/usr/bin/env node

// This file serves as the executable entry point for the CLI
const { main } = require("../dist/index.js");

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
