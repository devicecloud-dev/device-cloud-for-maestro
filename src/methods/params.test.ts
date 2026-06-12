import { beforeEach, describe, expect, it, vi } from 'vitest';

// Drive getParameters() through mocked GitHub Actions SDKs. `inputs` is the
// per-test action-input map; getInput/getMultilineInput read from it.
const { inputs } = vi.hoisted(() => ({ inputs: {} as Record<string, string> }));

vi.mock('@actions/core', () => ({
  getInput: (name: string) => inputs[name] ?? '',
  getMultilineInput: (name: string) =>
    inputs[name] ? inputs[name].split('\n').filter((l) => l.trim() !== '') : [],
}));

vi.mock('@actions/github', () => ({
  context: {
    sha: 'cafebabe',
    runId: 42,
    ref: 'refs/heads/feature-x',
    eventName: 'push',
    repo: { owner: 'acme', repo: 'widgets' },
    payload: {},
  },
}));

import { getParameters } from './params';

beforeEach(() => {
  for (const k of Object.keys(inputs)) delete inputs[k];
  // A valid baseline: api key + exactly one app source.
  inputs['api-key'] = 'k';
  inputs['app-file'] = 'app.apk';
});

describe('getParameters', () => {
  it('requires exactly one of app-file / app-binary-id', async () => {
    inputs['app-file'] = '';
    inputs['app-binary-id'] = '';
    await expect(getParameters()).rejects.toThrow(
      /Either app-file or app-binary-id/
    );

    inputs['app-file'] = 'app.apk';
    inputs['app-binary-id'] = 'bin-123';
    await expect(getParameters()).rejects.toThrow(
      /Either app-file or app-binary-id/
    );
  });

  it('parses tags: comma list -> array, single -> one element, empty -> null', async () => {
    inputs['include-tags'] = 'smoke, regression';
    inputs['exclude-tags'] = 'flaky';
    let params = await getParameters();
    expect(params.includeTags).toEqual(['smoke', 'regression']);
    expect(params.excludeTags).toEqual(['flaky']);

    inputs['include-tags'] = '';
    params = await getParameters();
    expect(params.includeTags).toBeNull();
  });

  it('validates orientation (accepts 0/90/180/270, throws otherwise)', async () => {
    inputs['orientation'] = '90';
    expect((await getParameters()).orientation).toBe(90);

    inputs['orientation'] = '45';
    await expect(getParameters()).rejects.toThrow(/Invalid orientation/);
  });

  it('validates download-artifacts (accepts ALL/FAILED, throws otherwise)', async () => {
    inputs['download-artifacts'] = 'FAILED';
    expect((await getParameters()).downloadArtifacts).toBe('FAILED');

    inputs['download-artifacts'] = 'SOME';
    await expect(getParameters()).rejects.toThrow(/Invalid download-artifacts/);
  });

  it('validates report format (accepts junit/html, throws otherwise)', async () => {
    inputs['report'] = 'junit';
    expect((await getParameters()).report).toBe('junit');

    inputs['report'] = 'pdf';
    await expect(getParameters()).rejects.toThrow(/Report format must be/);
  });

  it('coerces android-api-level and ios-version to numbers', async () => {
    inputs['android-api-level'] = '34';
    inputs['ios-version'] = '17';
    const params = await getParameters();
    expect(params.androidApiLevel).toBe(34);
    expect(params.iOSVersion).toBe(17);
  });

  it('maps boolean inputs from the string "true"', async () => {
    inputs['async'] = 'true';
    inputs['google-play'] = 'true';
    inputs['debug'] = 'true';
    let params = await getParameters();
    expect(params.async).toBe(true);
    expect(params.googlePlay).toBe(true);
    expect(params.debug).toBe(true);

    inputs['async'] = 'false';
    params = await getParameters();
    expect(params.async).toBe(false);
  });

  it('normalises empty device inputs to null', async () => {
    let params = await getParameters();
    expect(params.androidDevice).toBeNull();
    expect(params.iosDevice).toBeNull();

    inputs['android-device'] = 'pixel-6';
    params = await getParameters();
    expect(params.androidDevice).toBe('pixel-6');
  });

  it('defaults the api url and infers the run name from the commit sha', async () => {
    const params = await getParameters();
    expect(params.apiUrl).toBe('https://api.devicecloud.dev');
    expect(params.name).toBe('cafebabe');
  });

  it('attaches github context metadata by default, omitting it when disabled', async () => {
    const withCtx = await getParameters();
    expect(withCtx.githubContext).toContain('gh_sha=cafebabe');
    expect(withCtx.githubContext).toContain('gh_run_id=42');
    expect(withCtx.githubContext).toContain('gh_repo=acme/widgets');
    expect(withCtx.githubContext).toContain('gh_branch=feature-x');

    inputs['include-github-context'] = 'false';
    const withoutCtx = await getParameters();
    expect(withoutCtx.githubContext).toBeUndefined();
  });

  it('honours an explicit api-url and name over the defaults', async () => {
    inputs['api-url'] = 'https://api.dev.devicecloud.dev';
    inputs['name'] = 'My Custom Run';
    const params = await getParameters();
    expect(params.apiUrl).toBe('https://api.dev.devicecloud.dev');
    expect(params.name).toBe('My Custom Run');
  });
});
