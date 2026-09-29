import * as fs from 'fs';
import * as path from 'path';

/**
 * The action's own version, read from package.json at RUNTIME.
 *
 * `entryDir` is the directory of the running entry file: `dist/` in the
 * published action and `src/` from source. Both sit one level below
 * package.json, so `<entryDir>/../package.json` is the repo root's either way.
 *
 * This is deliberately not `require('../package.json')` or a JSON import. ncc
 * inlines those into dist/index.js, so dist then carried whatever version was
 * current when it was last built. v2.5.0 shipped reporting 2.4.0 that way, and
 * a release-please release PR (which bumps only package.json) would either tag
 * a dist holding the previous version or force a dist rebuild into the release
 * commit. The path is built from a parameter so ncc's asset relocator can't
 * resolve it at build time and copy package.json into dist/.
 *
 * Best-effort: returns undefined rather than throwing.
 */
export function readWrapperVersion(entryDir: string): string | undefined {
  try {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(entryDir, '..', 'package.json'), 'utf8'),
    ) as { version?: unknown };
    return typeof manifest.version === 'string' && manifest.version
      ? manifest.version
      : undefined;
  } catch {
    return undefined;
  }
}
