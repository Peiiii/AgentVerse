#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const SEARCH_ROOTS = ["src", "packages"];
const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "tmp",
  ".next",
  "public",
]);
const IGNORE_FILES = new Set([".DS_Store"]);
const DEFAULT_LIMIT = 20;

// ─────────────────────────────────────────────────────────────────────────────
// ANSI Colors
// ─────────────────────────────────────────────────────────────────────────────

function createColors(enabled) {
  const wrap = (code) => (text) =>
    enabled ? `${code}${text}\x1b[0m` : String(text);
  return {
    dim: wrap("\x1b[2m"),
    accent: wrap("\x1b[38;5;114m"),
    cyan: wrap("\x1b[38;5;81m"),
    yellow: wrap("\x1b[38;5;221m"),
    muted: wrap("\x1b[38;5;240m"),
    pink: wrap("\x1b[38;5;211m"),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI Argument Parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  let outDir;
  let limit = DEFAULT_LIMIT;
  let color = true;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out") {
      outDir = args[i + 1];
      i += 1;
    } else if (arg.startsWith("--out=")) {
      outDir = arg.slice("--out=".length);
    } else if (arg === "--limit") {
      limit = Number(args[i + 1]) || DEFAULT_LIMIT;
      i += 1;
    } else if (arg.startsWith("--limit=")) {
      limit = Number(arg.slice("--limit=".length)) || DEFAULT_LIMIT;
    } else if (arg === "--no-color") {
      color = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return { outDir, limit, color };
}

function printHelp() {
  console.log("Usage: node scripts/metrics/top-loc.cjs [options]");
  console.log("");
  console.log("Options:");
  console.log("  --limit <n>   Number of files to show (default: 20)");
  console.log("  --out <dir>   Write output to file in specified directory");
  console.log("  --no-color    Disable ANSI colors");
  console.log("  -h, --help    Show this help message");
}

// ─────────────────────────────────────────────────────────────────────────────
// File System Utilities
// ─────────────────────────────────────────────────────────────────────────────

function shouldIgnoreDir(name) {
  return IGNORE_DIRS.has(name);
}

function shouldIgnoreFile(name) {
  return IGNORE_FILES.has(name);
}

function countLines(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const total = lines.length;
  const nonEmpty = lines.filter((l) => l.trim().length > 0).length;
  return { total, nonEmpty };
}

function walkDir(dirPath, results) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (shouldIgnoreDir(entry.name)) continue;
      walkDir(path.join(dirPath, entry.name), results);
    } else if (entry.isFile()) {
      if (shouldIgnoreFile(entry.name)) continue;
      const filePath = path.join(dirPath, entry.name);
      const { total, nonEmpty } = countLines(filePath);
      const ext = path.extname(entry.name);
      results.push({ path: filePath, total, nonEmpty, ext });
    }
  }
}

function collectFiles() {
  const files = [];
  for (const root of SEARCH_ROOTS) {
    const rootPath = path.resolve(process.cwd(), root);
    if (!fs.existsSync(rootPath)) continue;
    walkDir(rootPath, files);
  }
  return files;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────────────────────

function getExtColor(ext, c) {
  const colors = {
    ".tsx": c.cyan,
    ".ts": c.accent,
    ".jsx": c.cyan,
    ".js": c.yellow,
    ".md": c.pink,
    ".css": c.yellow,
  };
  return colors[ext] || c.dim;
}

function createBar(value, max, width, c) {
  const percentage = max > 0 ? value / max : 0;
  const filled = Math.round(percentage * width);
  const empty = width - filled;
  return c.accent("█".repeat(filled)) + c.muted("░".repeat(empty));
}

function formatText(files, limit, colorize) {
  const c = createColors(colorize);
  const lines = [];
  const topFiles = files.slice(0, limit);
  const maxLoc = topFiles.length > 0 ? topFiles[0].total : 0;
  const totalLoc = files.reduce((sum, f) => sum + f.total, 0);
  const totalFiles = files.length;

  lines.push(`Top ${limit} Files by Lines of Code  ${c.muted(`(${totalFiles} files, ${totalLoc.toLocaleString()} total lines)`)}`);

  // Calculate max path length for alignment
  const pathWidth = 50;

  for (let i = 0; i < topFiles.length; i++) {
    const file = topFiles[i];
    const rel = path.relative(process.cwd(), file.path).split(path.sep).join("/");
    const ext = file.ext;
    const extColor = getExtColor(ext, c);

    // Truncate path if needed
    let displayPath = rel;
    if (rel.length > pathWidth) {
      displayPath = "…" + rel.slice(rel.length - pathWidth + 1);
    }

    // Format: rank. path (loc lines)  [bar]
    const rank = String(i + 1).padStart(2, " ");
    const bar = createBar(file.total, maxLoc, 20, c);
    const locStr = String(file.total).padStart(4, " ");

    lines.push(
      `${c.muted(rank + ".")} ${extColor(displayPath.padEnd(pathWidth))}  ${c.cyan(locStr)} ${c.muted("lines")}  ${bar}`
    );
  }

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// File Output
// ─────────────────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeOutput(outDir, content) {
  ensureDir(outDir);
  const txtPath = path.join(outDir, "top-loc.txt");
  fs.writeFileSync(txtPath, `${content}\n`, "utf8");
  return { txtPath };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Entry Point
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const { outDir, limit, color } = parseArgs(process.argv);
  const files = collectFiles();
  files.sort((a, b) => b.total - a.total || b.nonEmpty - a.nonEmpty);
  const useColor = outDir ? false : color;
  const text = formatText(files, limit, useColor);

  if (outDir) {
    const resolved = path.resolve(process.cwd(), outDir);
    const { txtPath } = writeOutput(resolved, text);
    console.log(`Wrote: ${path.relative(process.cwd(), txtPath).split(path.sep).join("/")}`);
    return;
  }

  console.log(text);
}

main();
