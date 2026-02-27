import ts from 'typescript';
import fs from 'fs';
import path from 'path';

function findFiles(dir, extensions) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
      results = results.concat(findFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const rootDir = path.resolve('.');
const files = findFiles(rootDir, ['.ts', '.tsx']);

console.log(`Found ${files.length} TypeScript files to convert.\n`);

for (const file of files) {
  const source = fs.readFileSync(file, 'utf-8');
  const isTsx = file.endsWith('.tsx');

  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: isTsx ? ts.JsxEmit.Preserve : undefined,
      esModuleInterop: true,
      skipLibCheck: true,
      removeComments: false,
    },
    fileName: path.basename(file),
  });

  const newExt = isTsx ? '.jsx' : '.js';
  const newFile = file.replace(/\.(tsx?)$/, newExt);

  // Delete existing JS/JSX file if it exists (from prior partial conversion)
  if (fs.existsSync(newFile) && newFile !== file) {
    fs.unlinkSync(newFile);
  }

  fs.writeFileSync(newFile, result.outputText);
  fs.unlinkSync(file); // Remove the original .ts/.tsx file

  const rel = path.relative(rootDir, file);
  const relNew = path.relative(rootDir, newFile);
  console.log(`  ${rel} -> ${relNew}`);
}

console.log(`\nDone! Converted ${files.length} files.`);
