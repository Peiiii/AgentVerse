#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, '../src');

// 统计包含中文的文件
function findChineseFiles() {
  try {
    const result = execSync(
      `grep -r "[\\u4e00-\\u9fa5]" ${srcDir} --include="*.tsx" --include="*.ts" -l | grep -v node_modules | grep -v ".json"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

// 统计使用 i18n 的文件
function findI18nFiles() {
  try {
    const result = execSync(
      `grep -r "useTranslation\\|t(" ${srcDir} --include="*.tsx" --include="*.ts" -l | grep -v node_modules`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

// 统计文件中的中文行数
function countChineseLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    let count = 0;
    lines.forEach(line => {
      if (/[\u4e00-\u9fa5]/.test(line)) {
        count++;
      }
    });
    return count;
  } catch (e) {
    return 0;
  }
}

// 检查文件是否使用了 i18n
function hasI18n(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return /useTranslation|t\(/.test(content);
  } catch (e) {
    return false;
  }
}

console.log('🔍 正在分析国际化覆盖率...\n');

const chineseFiles = findChineseFiles();
const i18nFiles = findI18nFiles();

console.log(`📊 统计结果：`);
console.log(`- 包含中文的文件数: ${chineseFiles.length}`);
console.log(`- 使用 i18n 的文件数: ${i18nFiles.length}\n`);

// 分析每个文件
const fileStats = chineseFiles.map(file => {
  const chineseLines = countChineseLines(file);
  const hasI18nUsage = hasI18n(file);
  return {
    file,
    chineseLines,
    hasI18nUsage,
    relativePath: path.relative(srcDir, file)
  };
}).sort((a, b) => b.chineseLines - a.chineseLines);

// 统计
const totalChineseLines = fileStats.reduce((sum, f) => sum + f.chineseLines, 0);
const i18nFilesCount = fileStats.filter(f => f.hasI18nUsage).length;
const nonI18nFiles = fileStats.filter(f => !f.hasI18nUsage && f.chineseLines > 0);

console.log(`📈 覆盖率分析：`);
console.log(`- 总中文行数: ${totalChineseLines}`);
console.log(`- 已国际化文件: ${i18nFilesCount}/${chineseFiles.length} (${Math.round(i18nFilesCount/chineseFiles.length*100)}%)`);
console.log(`- 未国际化文件: ${nonI18nFiles.length}\n`);

// 显示需要优先处理的文件（中文行数最多的未国际化文件）
console.log(`⚠️  需要优先国际化的文件（Top 20）：\n`);
nonI18nFiles.slice(0, 20).forEach((f, i) => {
  console.log(`${i + 1}. ${f.relativePath} (${f.chineseLines} 行中文)`);
});

// 按目录分组统计
const dirStats = {};
nonI18nFiles.forEach(f => {
  const dir = path.dirname(f.relativePath);
  if (!dirStats[dir]) {
    dirStats[dir] = { files: 0, lines: 0 };
  }
  dirStats[dir].files++;
  dirStats[dir].lines += f.chineseLines;
});

console.log(`\n📁 按目录统计（未国际化）：\n`);
Object.entries(dirStats)
  .sort((a, b) => b[1].lines - a[1].lines)
  .slice(0, 10)
  .forEach(([dir, stats]) => {
    console.log(`${dir}: ${stats.files} 个文件, ${stats.lines} 行中文`);
  });

console.log(`\n✅ 建议：`);
console.log(`1. 优先处理用户界面相关的文件（components, pages）`);
console.log(`2. 使用 i18n Ally 扩展可以实时查看哪些文本需要国际化`);
console.log(`3. 运行 pnpm i18n:scan 可以扫描已使用 t() 的代码`);

