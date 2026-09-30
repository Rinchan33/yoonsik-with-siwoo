import { mkdir, copyFile, cp, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, basename, resolve } from 'node:path';
const root = new URL('../', import.meta.url);
const output = new URL('dist/', root);
const outputPath = resolve(fileURLToPath(output));
if (dirname(outputPath) !== resolve(fileURLToPath(root)) || basename(outputPath) !== 'dist') throw new Error('Build output must be the project dist directory.');
// Only remove the verified build output, so deleted source images do not survive a rebuild.
await rm(outputPath, {recursive:true, force:true});
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'data.js', 'schedule-data.js', 'magazine-data.js', 'favicon.svg']) await copyFile(new URL(file, root), new URL(file, output));
await cp(new URL('resource/', root), new URL('resource/', output), { recursive: true });
await writeFile(new URL('.nojekyll', output), '');
console.log('静态网站已生成到 dist/，所有资源使用相对路径。');
