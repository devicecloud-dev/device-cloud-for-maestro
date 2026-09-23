import * as fs from 'fs';
import * as path from 'path';

/** Characters that make an app-file value a glob pattern. */
const GLOB_CHARS = /[*?[\]{}]/;

export type AppFileResolution = {
  /** What to hand the CLI. */
  path: string;
  /** Every match when the input was expanded as a glob, sorted; else empty. */
  matches: string[];
};

/**
 * Resolve the app-file input, so it can be a glob as it can with Maestro
 * Cloud's action (e.g. `app/build/outputs/apk/release/*.apk`).
 *
 * A value without glob characters is returned unchanged, and so is one that
 * exists as written, so a path that happens to contain `[` or `{` keeps
 * working. Anything else is expanded relative to `cwd` and the first match in
 * sorted order wins: sorting makes the pick the same on every runner, which
 * the order the filesystem lists entries in is not. Directories match too,
 * since an iOS simulator build is a `.app` directory.
 *
 * Uses Node's built-in fs.globSync (Node 22+; the action runs on node24), so
 * no glob library is bundled.
 */
export function resolveAppFile(
  appFile: string,
  cwd: string = process.cwd()
): AppFileResolution {
  if (
    !appFile ||
    !GLOB_CHARS.test(appFile) ||
    fs.existsSync(path.resolve(cwd, appFile))
  ) {
    return { path: appFile, matches: [] };
  }

  const matches = fs.globSync(appFile, { cwd }).sort();
  if (matches.length === 0) {
    throw new Error(`No file matches the app-file pattern "${appFile}"`);
  }
  return { path: matches[0], matches };
}
