import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { resolveAppFile } from './app-file';

// A throwaway workspace: two release APKs (created out of order), a nested
// debug APK, a simulator build (.app is a directory) and a file whose name
// contains glob characters.
let cwd: string;

beforeAll(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'dcd-app-file-'));
  const touch = (rel: string) => {
    fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
    fs.writeFileSync(path.join(cwd, rel), '');
  };
  touch('build/release/app-z.apk');
  touch('build/release/app-a.apk');
  touch('build/debug/nested/app-debug.apk');
  touch('build/app [1].apk');
  fs.mkdirSync(path.join(cwd, 'ios/Build/MyApp.app'), { recursive: true });
  touch('ios/Build/MyApp.app/Info.plist');
});

afterAll(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

describe('resolveAppFile', () => {
  it('passes a plain path through unchanged, even if it does not exist', () => {
    expect(resolveAppFile('build/app.apk', cwd)).toEqual({
      path: 'build/app.apk',
      matches: [],
    });
    expect(resolveAppFile('', cwd)).toEqual({ path: '', matches: [] });
  });

  it('keeps a path that exists as written, glob characters and all', () => {
    expect(resolveAppFile('build/app [1].apk', cwd).path).toBe(
      'build/app [1].apk'
    );
  });

  it('resolves a glob to its single match', () => {
    expect(resolveAppFile('build/debug/**/*.apk', cwd)).toEqual({
      path: path.join('build', 'debug', 'nested', 'app-debug.apk'),
      matches: [path.join('build', 'debug', 'nested', 'app-debug.apk')],
    });
  });

  it('uses the first match in sorted order when several match', () => {
    const { path: picked, matches } = resolveAppFile(
      'build/release/*.apk',
      cwd
    );
    expect(picked).toBe(path.join('build', 'release', 'app-a.apk'));
    expect(matches).toEqual([
      path.join('build', 'release', 'app-a.apk'),
      path.join('build', 'release', 'app-z.apk'),
    ]);
  });

  it('supports brace patterns', () => {
    expect(resolveAppFile('build/release/app-{z,y}.apk', cwd).path).toBe(
      path.join('build', 'release', 'app-z.apk')
    );
  });

  it('matches a .app simulator build, which is a directory', () => {
    expect(resolveAppFile('ios/**/*.app', cwd).path).toBe(
      path.join('ios', 'Build', 'MyApp.app')
    );
  });

  it('throws when a glob matches nothing', () => {
    expect(() => resolveAppFile('build/**/*.ipa', cwd)).toThrow(
      'No file matches the app-file pattern "build/**/*.ipa"'
    );
  });
});
