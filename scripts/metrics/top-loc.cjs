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

function createColors(enabled) {
  const wrap = (code) => (text) =>
    enabled ? `${code}${text}\x1b[0m` : String(text);
  return {
    title: wrap("\x1b[1;36m"),
    heading: wrap("\x1b[1;34m"),
    label: wrap("\x1b[90m"),
    value: wrap("\x1b[33m"),
    accent: wrap("\x1b[32m"),
  };
}

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
  console.log("Usage: node scripts/metrics/top-loc.cjs [--limit <n>] [--out <dir>]");
  console.log("Example: node scripts/metrics/top-loc.cjs --limit 20 --out docs/logs/metrics/latest");
  console.log("Options:");
  console.log("  --no-color    Disable ANSI colors (always off when writing to file)");
}

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
      results.push({ path: filePath, total, nonEmpty });
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

function formatText(files, limit, generatedAt, colorize) {
  const pad = (str, len) => String(str).padEnd(len, " ");
  const num = (n, len) => String(n).padStart(len, " ");
  const c = createColors(colorize);
  const lines = [];
  lines.push(c.title(`Top ${limit} Files by Lines of Code`));
  lines.push(c.label(`Generated: ${generatedAt}`));
  lines.push("");
  lines.push(
    c.label(
      pad("Path", 60) + num("Total", 8) + "  " + num("Non-empty", 10)
    )
  );
  lines.push(
    c.label("-".repeat(60) + " " + "-".repeat(8) + "  " + "-".repeat(10))
  );
  for (const file of files.slice(0, limit)) {
    const rel = path.relative(process.cwd(), file.path).split(path.sep).join("/");
    const truncated =
      rel.length > 60 ? `...${rel.slice(rel.length - 57)}` : rel.padEnd(60, " ");
    lines.push(
      c.heading(truncated) +
        c.value(num(file.total, 8)) +
        "  " +
        c.accent(num(file.nonEmpty, 10))
    );
  }
  lines.push("");
  lines.push(c.heading("Notes"));
  lines.push(
    c.label(
      "  ignored dirs: node_modules, .git, dist, build, coverage, tmp, .next, public"
    )
  );
  return lines.join("\n");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeOutput(outDir, content) {
  ensureDir(outDir);
  const txtPath = path.join(outDir, "top-loc.txt");
  fs.writeFileSync(txtPath, `${content}\n`, "utf8");
  return { txtPath };
}

function main() {
  const { outDir, limit, color } = parseArgs(process.argv);
  const files = collectFiles();
  files.sort((a, b) => b.total - a.total || b.nonEmpty - a.nonEmpty);
  const generatedAt = new Date().toISOString();
  const useColor = outDir ? false : color;
  const text = formatText(files, limit, generatedAt, useColor);

  if (outDir) {
    const resolved = path.resolve(process.cwd(), outDir);
    const { txtPath } = writeOutput(resolved, text);
    console.log(`Wrote: ${path.relative(process.cwd(), txtPath).split(path.sep).join("/")}`);
    return;
  }

  console.log(text);
}

main();
