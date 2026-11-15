// Joins README.md and every docs/*.md file into proyecto-completo.md,
// so the whole project can be uploaded to NotebookLM or any chatbot as one file.
// Usage (from the repository root): node herramientas/combinar.mjs
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'docs');

const files = [
  'README.md',
  ...(existsSync(join(root, 'TRASPASO.md')) ? ['TRASPASO.md'] : []),
  ...readdirSync(docsDir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => `docs/${name}`),
];

const today = new Date().toISOString().slice(0, 10);
const parts = [
  '# Space Apps 2026 · Proyecto completo',
  '',
  `Archivo generado el ${today} con \`node herramientas/combinar.mjs\`. No lo edites a mano: edita los archivos de \`docs/\` y vuelve a generarlo.`,
  '',
  `Contiene ${files.length} archivos, en este orden: ${files.join(', ')}.`,
];

for (const file of files) {
  const text = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n').trim();
  parts.push('', '---', '', `<!-- Archivo: ${file} -->`, `> **Archivo: \`${file}\`**`, '', text);
}

writeFileSync(join(root, 'proyecto-completo.md'), `${parts.join('\n')}\n`, 'utf8');
console.log(`proyecto-completo.md: ${files.length} archivos combinados.`);
