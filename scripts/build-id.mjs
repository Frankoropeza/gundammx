// Sella el SHA del commit en dist/build-id.txt — gate de deploy OrigenLab.
// El gate se lo pide al dominio: si no lo devuelve, el deploy no llego a produccion.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const sha = process.env.CF_PAGES_COMMIT_SHA || process.env.WORKERS_CI_COMMIT_SHA
  || process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();
writeFileSync('dist/build-id.txt', sha + '\n');
console.log('build-id sellado:', sha);
