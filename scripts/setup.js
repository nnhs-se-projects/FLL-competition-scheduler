/**
 * FLL Competition Scheduler - Setup Script
 *
 * This script sets up the project by creating necessary directories and files.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Directories to create
const directories = [
  "src/data",
  "src/web/public/css",
  "src/web/public/js",
  "src/web/public/img",
  "logs",
];

// Create directories if they don't exist
directories.forEach((dir) => {
  const dirPath = path.join(rootDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log("Setup completed successfully!");
