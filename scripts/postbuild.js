import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(process.cwd(), 'dist');
const TARGET = 'http://localhost:3001';
const REPLACEMENT = 'https://biseda-ai.onrender.com';
const VALID_EXTENSIONS = new Set(['.js', '.html', '.css']);

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (!VALID_EXTENSIONS.has(ext)) {
    return;
  }

  const original = readFileSync(filePath, 'utf8');
  if (!original.includes(TARGET)) {
    return;
  }

  const updated = original.split(TARGET).join(REPLACEMENT);
  writeFileSync(filePath, updated, 'utf8');
  console.log(`🔄 Replaced backend URL in ${path.relative(process.cwd(), filePath)}`);
}

function walk(directory) {
  const entries = readdirSync(directory);
  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath);
    } else {
      replaceInFile(fullPath);
    }
  }
}

walk(DIST_DIR);

