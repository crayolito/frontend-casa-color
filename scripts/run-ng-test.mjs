/**
 * Vitest (via @angular/build:unit-test) breaks on Windows when the cwd
 * drive letter is lowercase (e.g. c:\...). Normalize before spawning ng test.
 * @see https://github.com/angular/angular-cli/issues/32087
 */
import { spawnSync } from 'node:child_process';
import { chdir, cwd, exit, platform } from 'node:process';

if (platform === 'win32') {
  const normalized = cwd().replace(/^([a-zA-Z]):/, (_, d) => `${d.toUpperCase()}:`);
  if (normalized !== cwd()) {
    chdir(normalized);
  }
}

const result = spawnSync('npx', ['ng', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

exit(result.status ?? 1);
