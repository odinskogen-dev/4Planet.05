import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const base = resolve(dirname(fileURLToPath(import.meta.url)), '..');
await mkdir(resolve(base, 'public'), { recursive: true });
await copyFile(resolve(base, '../../site/roma/index.html'), resolve(base, 'public/legacy.html'));
console.info('Preserved ROMA 3D Challenger copied without modification for local testing');
