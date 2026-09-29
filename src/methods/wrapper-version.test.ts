import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { readWrapperVersion } from './wrapper-version';

// A throwaway action checkout: <root>/package.json next to <root>/dist/.
let root: string;

const writeManifest = (contents: string) =>
  fs.writeFileSync(path.join(root, 'package.json'), contents);

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'dcd-wrapper-version-'));
  fs.mkdirSync(path.join(root, 'dist'));
});

afterAll(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe('readWrapperVersion', () => {
  it('reads the package.json one level above the entry directory', () => {
    writeManifest(JSON.stringify({ name: 'x', version: '9.8.7' }));
    expect(readWrapperVersion(path.join(root, 'dist'))).toBe('9.8.7');
  });

  it('picks up a version bump without a rebuild (nothing is cached)', () => {
    writeManifest(JSON.stringify({ version: '9.8.7' }));
    expect(readWrapperVersion(path.join(root, 'dist'))).toBe('9.8.7');
    writeManifest(JSON.stringify({ version: '9.9.0' }));
    expect(readWrapperVersion(path.join(root, 'dist'))).toBe('9.9.0');
  });

  it('resolves the repo root package.json from src/', () => {
    const own = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'),
    ) as { version: string };
    expect(readWrapperVersion(path.join(__dirname, '..'))).toBe(own.version);
  });

  it('returns undefined instead of throwing when it cannot tell', () => {
    expect(readWrapperVersion(path.join(root, 'no', 'such', 'dir'))).toBe(
      undefined,
    );
    writeManifest('{ not json');
    expect(readWrapperVersion(path.join(root, 'dist'))).toBe(undefined);
    writeManifest(JSON.stringify({ name: 'x' }));
    expect(readWrapperVersion(path.join(root, 'dist'))).toBe(undefined);
    writeManifest(JSON.stringify({ version: '' }));
    expect(readWrapperVersion(path.join(root, 'dist'))).toBe(undefined);
  });
});
