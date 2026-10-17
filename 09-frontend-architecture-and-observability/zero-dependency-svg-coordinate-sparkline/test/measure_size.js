import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentPath = path.resolve(__dirname, '../src/TrendChart.tsx');
const content = fs.readFileSync(componentPath, 'utf8');

const rawBytes = Buffer.byteLength(content, 'utf8');
const gzipped = zlib.gzipSync(content, { level: 9 });
const gzipBytes = gzipped.length;
const lineCount = content.trim().split('\n').length;

console.log('--- Zero-Dependency SVG Sparkline Size Measurement ---');
console.log(`File: src/TrendChart.tsx`);
console.log(`Lines: ${lineCount} lines`);
console.log(`Raw Size: ${rawBytes} bytes (${(rawBytes / 1024).toFixed(2)} KB)`);
console.log(`Gzip Size (level 9): ${gzipBytes} bytes (${(gzipBytes / 1024).toFixed(2)} KB)`);

if (gzipBytes > 1024) {
    console.error('FAIL: Gzip size exceeds 1 KB budget!');
    process.exit(1);
} else {
    console.log('PASS: Component size is well within sub-1KB micro-component budget.');
}
