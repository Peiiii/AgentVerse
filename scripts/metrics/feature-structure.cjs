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
    muted: wrap("\x1b[38;5;240m"),
    tree: wrap("\x1b[38;5;240m"),
  };
}

// Tree-drawing characters
const TREE = {
  pipe: "│",
  tee: "├──",
  corner: "└──",
  space: "    ",
  pipeSpace: "│   ",
};

// ─────────────────────────────────────────────────────────────────────────────
// CLI Argument Parsing
// ─────────────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  let outDir;
  let color = true;
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out") {
      outDir = args[i + 1];
      i += 1;
    } else if (arg.startsWith("--out=")) {
      outDir = arg.slice("--out=".length);
    } else if (arg === "--no-color") {
      color = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }
  return { outDir, color };
}

function printHelp() {
  console.log("Usage: node scripts/metrics/feature-structure.cjs [options]");
  console.log("");
  console.log("Options:");
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
    }
  }
}

function collectSubdirs(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !shouldIgnoreDir(e.name))
    .map((e) => e.name)
    .sort();
}

function buildFeatureStats(rootDir, featureName) {
  const featurePath = path.join(rootDir, featureName);
  const stats = {
    name: featureName,
    path: featurePath,
    fileCount: 0,
    dirCount: 0,
    subdirs: collectSubdirs(featurePath),
  };
  walkDir(featurePath, stats);
  return stats;
}

function toRelativePath(p) {
  return p.split(path.sep).join("/");
}

// ─────────────────────────────────────────────────────────────────────────────
// Report Building
// ─────────────────────────────────────────────────────────────────────────────

function buildReport() {
  const roots = [];
  let totalFeatureCount = 0;
  let totalFileCount = 0;
  let totalDirCount = 0;

  for (const root of FEATURE_ROOTS) {
    const rootPath = path.resolve(process.cwd(), root);
    const exists = fs.existsSync(rootPath);
    if (!exists) {
      roots.push({ root, exists: false, featureCount: 0, features: [] });
      continue;
    }

    const featureNames = collectFeatureDirs(rootPath);
    const features = featureNames.map((name) => buildFeatureStats(rootPath, name));

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
      fileCount,
      dirCount,
      features: features.map((f) => ({
        name: f.name,
        path: toRelativePath(path.relative(process.cwd(), f.path)),
        fileCount: f.fileCount,
        dirCount: f.dirCount,
        subdirs: f.subdirs,
      })),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    roots,
    totals: { featureCount: totalFeatureCount, fileCount: totalFileCount, dirCount: totalDirCount },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tree Rendering
// ─────────────────────────────────────────────────────────────────────────────

function getBranchLabel(rootPath) {
  return rootPath.split("/")[1] || rootPath;
}

function getBranchComment(branch) {
  const comments = { common: "跨平台共享代码", desktop: "桌面端专用代码", mobile: "移动端专用代码" };
  return comments[branch] || "";
}

function getSubdirComment(subdir) {
  const comments = {
    components: "UI 组件",
    hooks: "React Hooks",
    stores: "状态管理",
    services: "业务逻辑/API",
    types: "TypeScript 类型",
    utils: "工具函数",
    pages: "页面组件",
    layouts: "布局组件",
    contexts: "React Context",
    constants: "常量定义",
  };
  return comments[subdir] || "";
}

function renderTree(report, c) {
  const lines = [];

  lines.push(c.accent("src/"));

  for (let ri = 0; ri < report.roots.length; ri++) {
    const root = report.roots[ri];
    const isLastRoot = ri === report.roots.length - 1;
    const branchLabel = getBranchLabel(root.root);
    const rootConnector = isLastRoot ? TREE.corner : TREE.tee;
    const rootPrefix = isLastRoot ? TREE.space : TREE.pipeSpace;

    const branchComment = getBranchComment(branchLabel);
    const branchStats = root.exists ? `(${root.fileCount} files, ${root.dirCount} dirs)` : "(not found)";
    lines.push(
      `${c.tree(rootConnector)} ${c.accent(branchLabel + "/")}` +
      `  ${c.muted(branchStats)}` +
      (branchComment ? `  ${c.dim("# " + branchComment)}` : "")
    );

    if (!root.exists || root.features.length === 0) continue;

    // features/ subfolder
    lines.push(`${c.tree(rootPrefix)}${c.tree(TREE.corner)} features/`);
    const featuresPrefix = rootPrefix + TREE.space;

    // Sort features by file count (descending)
    const sortedFeatures = [...root.features].sort((a, b) => b.fileCount - a.fileCount);

    for (let fi = 0; fi < sortedFeatures.length; fi++) {
      const feature = sortedFeatures[fi];
      const isLastFeature = fi === sortedFeatures.length - 1;
      const featureConnector = isLastFeature ? TREE.corner : TREE.tee;
      const featurePrefix = featuresPrefix + (isLastFeature ? TREE.space : TREE.pipeSpace);

      const stats = `(${feature.fileCount} files, ${feature.dirCount} dirs)`;
      lines.push(
        `${c.tree(featuresPrefix)}${c.tree(featureConnector)} ${c.cyan(feature.name + "/")}  ${c.muted(stats)}`
      );

      // Subdirectories
      if (feature.subdirs.length > 0) {
        for (let si = 0; si < feature.subdirs.length; si++) {
          const subdir = feature.subdirs[si];
          const isLastSubdir = si === feature.subdirs.length - 1;
          const subdirConnector = isLastSubdir ? TREE.corner : TREE.tee;
          const subdirComment = getSubdirComment(subdir);

          lines.push(
            `${c.tree(featurePrefix)}${c.tree(subdirConnector)} ${subdir}/` +
            (subdirComment ? `  ${c.dim("# " + subdirComment)}` : "")
          );
        }
      }
    }
  }

  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Text Formatter
// ─────────────────────────────────────────────────────────────────────────────

function formatText(report, colorize) {
  const c = createColors(colorize);
  const lines = [];

  lines.push("");
  lines.push(`Feature Structure  ${c.muted(`(${report.totals.featureCount} features, ${report.totals.fileCount} files, ${report.totals.dirCount} dirs)`)}`);
  lines.push("");

  const treeLines = renderTree(report, c);
  for (const line of treeLines) {
    lines.push(line);
  }

  lines.push("");

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// File Output
// ─────────────────────────────────────────────────────────────────────────────

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeOutput(outDir, report) {
  ensureDir(outDir);
  const txtPath = path.join(outDir, "feature-structure.txt");
  fs.writeFileSync(txtPath, `${formatText(report, false)}\n`, "utf8");
  return { txtPath };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Entry Point
// ─────────────────────────────────────────────────────────────────────────────

function main() {
  const { outDir, color } = parseArgs(process.argv);
  const report = buildReport();

  if (outDir) {
    const resolved = path.resolve(process.cwd(), outDir);
    const { txtPath } = writeOutput(resolved, report);
    console.log(`Wrote: ${toRelativePath(path.relative(process.cwd(), txtPath))}`);
    return;
  }

  console.log(formatText(report, color));
}

main();
