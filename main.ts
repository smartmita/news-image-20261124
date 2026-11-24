// World news broadsheet entry for Tuesday 24 November 2026 (Node 22 stdlib only).
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outputDir, { recursive: true });

const srcPath = new URL('./entry.png', import.meta.url);
const dstPath = join(outputDir, 'entry.png');
copyFileSync(srcPath, dstPath);

const info = statSync(dstPath);
if (info.size === 0 || info.size > 1048576) {
  throw new Error(`Invalid entry.png size: ${info.size}`);
}
const header = readFileSync(dstPath).subarray(0, 8);
if (!header.equals(PNG_MAGIC)) {
  throw new Error('Output file is not a valid PNG');
}
console.log(`Wrote ${dstPath} (${info.size} bytes)`);
