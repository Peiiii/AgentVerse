#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const FEATURE_ROOTS = [
  "src/common/features",
  "src/desktop/features",
  "src/mobile/features",
];

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "tmp",
  ".next",
]);

const IGNORE_FILES = new Set([".DS_Store"]);

function parseArgs(argv) {
  const args = argv.slice(2);
  let outDir;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out") {
      outDir = args[i + 1];
      i += 1;
    } else if (arg.startsWith("--out=")) {
      outDir = arg.slice("--out=".length);
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return { outDir };
}

function printHelp() {
  console.log("Usage: node scripts/metrics/feature-structure.cjs [--out <dir>]");
  console.log("Example: node scripts/metrics/feature-structure.cjs --out docs/logs/metrics/latest");
}

function shouldIgnoreDir(name) {
  return IGNORE_DIRS.has(name);
}

function shouldIgnoreFile(name) {
  return IGNORE_FILES.has(name);
}

function collectFeatureDirs(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !shouldIgnoreDir(name))
    .sort();
}

function walkDir(dirPath, stats) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (shouldIgnoreDir(entry.name)) continue;
      stats.dirCount += 1;
      walkDir(entryPath, stats);
    } else if (entry.isFile()) {
      if (shouldIgnoreFile(entry.name)) continue;
      stats.fileCount += 1;
      const ext = path.extname(entry.name) || "<no_ext>";
      stats.extensions[ext] = (stats.extensions[ext] || 0) + 1;
    }
  }
}

function buildFeatureStats(rootDir, featureName) {
  const featurePath = path.join(rootDir, featureName);
  const stats = {
    name: featureName,
    path: featurePath,
    fileCount: 0,
    dirCount: 0,
    extensions: {},
  };
  walkDir(featurePath, stats);
  return stats;
}

function toRelativePath(p) {
  return p.split(path.sep).join("/");
}

function buildReport() {
  const roots = [];
  let totalFeatureCount = 0;
  let totalFileCount = 0;
  let totalDirCount = 0;

  for (const root of FEATURE_ROOTS) {
    const rootPath = path.resolve(process.cwd(), root);
    const exists = fs.existsSync(rootPath);
    if (!exists) {
      roots.push({
        root,
        exists: false,
        featureCount: 0,
        features: [],
      });
      continue;
    }

    const featureNames = collectFeatureDirs(rootPath);
    const features = featureNames.map((name) =>
      buildFeatureStats(rootPath, name)
    );

    const featureCount = features.length;
    const fileCount = features.reduce((acc, f) => acc + f.fileCount, 0);
    const dirCount = features.reduce((acc, f) => acc + f.dirCount, 0);

    totalFeatureCount += featureCount;
    totalFileCount += fileCount;
    totalDirCount += dirCount;

    roots.push({
      root,
      exists: true,
      featureCount,
      features: features.map((f) => ({
        name: f.name,
        path: toRelativePath(path.relative(process.cwd(), f.path)),
        fileCount: f.fileCount,
        dirCount: f.dirCount,
        extensions: f.extensions,
      })),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    roots,
    totals: {
      featureCount: totalFeatureCount,
      fileCount: totalFileCount,
      dirCount: totalDirCount,
    },
  };
}

function formatExtensions(extensions) {
  const entries = Object.entries(extensions);
  if (entries.length === 0) return "none";
  return entries
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([ext, count]) => `${ext}(${count})`)
    .join(" ");
}

function formatMarkdown(report) {
  const lines = [];
  lines.push("# Feature Structure");
  lines.push("");
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push("");

  for (const root of report.roots) {
    lines.push(`## ${root.root}`);
    if (!root.exists) {
      lines.push("");
      lines.push("- missing");
      lines.push("");
      continue;
    }
    if (root.features.length === 0) {
      lines.push("");
      lines.push("- none");
      lines.push("");
      continue;
    }
    lines.push("");
    for (const feature of root.features) {
      const extText = formatExtensions(feature.extensions);
      lines.push(
        `- ${feature.name} (files: ${feature.fileCount}, dirs: ${feature.dirCount}) ext: ${extText}`
      );
    }
    lines.push("");
  }

  lines.push("## Totals");
  lines.push("");
  lines.push(`- features: ${report.totals.featureCount}`);
  lines.push(`- files: ${report.totals.fileCount}`);
  lines.push(`- dirs: ${report.totals.dirCount}`);
  lines.push("");

  return lines.join("\n");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeOutput(outDir, report) {
  ensureDir(outDir);
  const jsonPath = path.join(outDir, "feature-structure.json");
  const mdPath = path.join(outDir, "feature-structure.md");
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(mdPath, `${formatMarkdown(report)}\n`, "utf8");
  return { jsonPath, mdPath };
}

function main() {
  const { outDir } = parseArgs(process.argv);
  const report = buildReport();

  if (outDir) {
    const resolved = path.resolve(process.cwd(), outDir);
    const { jsonPath, mdPath } = writeOutput(resolved, report);
    console.log(`Wrote: ${toRelativePath(path.relative(process.cwd(), jsonPath))}`);
    console.log(`Wrote: ${toRelativePath(path.relative(process.cwd(), mdPath))}`);
    return;
  }

  console.log(JSON.stringify(report, null, 2));
}

main();
