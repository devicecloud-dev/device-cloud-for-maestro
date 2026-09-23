import { describe, expect, it } from 'vitest';

import {
  evaluateRun,
  StatusResponse,
  supersedingConsoleUrl,
} from './status';

const consoleUrl =
  'https://console.devicecloud.dev/results?upload=old-upload&result=101';

const status = (overrides: Partial<StatusResponse>): StatusResponse => ({
  status: 'PASSED',
  tests: [],
  consoleUrl,
  appBinaryId: 'abi',
  ...overrides,
});

describe('evaluateRun', () => {
  it('passes a PASSED run that dcd agreed with', () => {
    expect(evaluateRun(status({ status: 'PASSED' }), 0)).toEqual({
      outcome: 'pass',
      uploadStatus: 'PASSED',
      message: 'Successfully completed test run.',
    });
  });

  it('fails a FAILED run even when dcd exited 0 (e.g. with json-file)', () => {
    const verdict = evaluateRun(status({ status: 'FAILED' }), 0);
    expect(verdict.outcome).toBe('fail');
    expect(verdict.uploadStatus).toBe('FAILED');
    expect(verdict.message).toBe(
      `Test run FAILED. Check flow results for details: ${consoleUrl}`
    );
  });

  it('fails when dcd exited non-zero, whatever the status says', () => {
    const verdict = evaluateRun(status({ status: 'PASSED' }), 2);
    expect(verdict.outcome).toBe('fail');
    expect(verdict.message).toContain('dcd exited 2, status PASSED');
  });

  it('warns on a non-terminal status after a clean exit', () => {
    const verdict = evaluateRun(status({ status: 'RUNNING' }), 0);
    expect(verdict.outcome).toBe('warn');
    expect(verdict.uploadStatus).toBe('RUNNING');
  });

  it('passes a superseded run and reports SUPERSEDED', () => {
    // The API rolls the superseded run's cancelled tests up to FAILED.
    const verdict = evaluateRun(
      status({ status: 'FAILED', supersededBy: 'new-upload' }),
      0
    );
    expect(verdict).toEqual({
      outcome: 'pass',
      uploadStatus: 'SUPERSEDED',
      message:
        'Superseded by new-upload: a newer run from the same CI context ' +
        'replaced this one, so this job does not fail. Newer run: ' +
        'https://console.devicecloud.dev/results?upload=new-upload',
    });
  });

  it('passes a superseded run even when an older CLI exited 2 for it', () => {
    const verdict = evaluateRun(
      status({ status: 'FAILED', supersededBy: 'new-upload' }),
      2
    );
    expect(verdict.outcome).toBe('pass');
    expect(verdict.uploadStatus).toBe('SUPERSEDED');
  });

  it('treats an absent, null or empty supersededBy as not superseded', () => {
    for (const supersededBy of [undefined, null, '']) {
      const verdict = evaluateRun(
        status({ status: 'FAILED', supersededBy }),
        0
      );
      expect(verdict.outcome).toBe('fail');
      expect(verdict.uploadStatus).toBe('FAILED');
    }
  });
});

describe('supersedingConsoleUrl', () => {
  it("swaps in the newer upload and drops this run's result link", () => {
    expect(supersedingConsoleUrl(consoleUrl, 'new-upload')).toBe(
      'https://console.devicecloud.dev/results?upload=new-upload'
    );
  });

  it('returns undefined without a usable console URL', () => {
    expect(supersedingConsoleUrl(undefined, 'new-upload')).toBeUndefined();
    expect(supersedingConsoleUrl('not a url', 'new-upload')).toBeUndefined();
  });
});
