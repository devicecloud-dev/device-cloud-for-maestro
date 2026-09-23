type Status = 'PASSED' | 'FAILED' | 'CANCELLED' | 'PENDING' | 'QUEUED' | 'RUNNING';

export interface TestResult {
  name: string;
  status: Status;
}

/** What `dcd status --json` prints (the API's /uploads/status response). */
export interface StatusResponse {
  status: Status;
  tests: TestResult[];
  consoleUrl?: string;
  appBinaryId?: string;
  /**
   * The upload that replaced this one through --cancel-previous. Only set on
   * a superseded run, and absent from APIs that predate it.
   */
  supersededBy?: string | null;
}

export type Verdict = {
  /** fail: setFailed; warn: a warning annotation; pass: an info line. */
  outcome: 'pass' | 'warn' | 'fail';
  /** The DEVICE_CLOUD_UPLOAD_STATUS output. */
  uploadStatus: string;
  message: string;
};

/**
 * The console link for the run that superseded this one. The status call's
 * consoleUrl deep-links one of THIS run's results, which the newer run does
 * not contain, so swap the upload and drop the result (as the CLI does).
 */
export function supersedingConsoleUrl(
  consoleUrl: string | undefined,
  supersededBy: string
): string | undefined {
  if (!consoleUrl) return undefined;
  try {
    const url = new URL(consoleUrl);
    url.searchParams.set('upload', supersededBy);
    url.searchParams.delete('result');
    return url.toString();
  } catch {
    return undefined;
  }
}

/**
 * Decide the job's outcome from the status call and the `dcd cloud` exit code.
 *
 * A superseded run passes, whatever else is true of it. A newer run from the
 * same CI context cancelled its queued tests (cancel-previous), and the API
 * rolls those up to FAILED, but the run no longer speaks for the commit.
 * Failing the job for it would fail it for work nobody is waiting on.
 * `dcd cloud` 5.6.0 exits 0 for such a run; an older CLI exits 2.
 *
 * Otherwise, fail on either signal. The exit code is authoritative for a run
 * that finished badly; the status call can only add failures the CLI could not
 * see. A non-terminal status (PENDING/RUNNING) alongside a clean exit is a racy
 * or degraded status call, not a failure: the CLI watched the run to
 * completion, so warn rather than turn the build red.
 */
export function evaluateRun(
  result: StatusResponse,
  cloudExitCode: number
): Verdict {
  const supersededBy =
    typeof result.supersededBy === 'string' ? result.supersededBy : '';
  if (supersededBy) {
    const newer = supersedingConsoleUrl(result.consoleUrl, supersededBy);
    return {
      outcome: 'pass',
      uploadStatus: 'SUPERSEDED',
      message:
        `Superseded by ${supersededBy}: a newer run from the same CI context ` +
        `replaced this one, so this job does not fail.` +
        (newer ? ` Newer run: ${newer}` : ''),
    };
  }

  const uploadStatus = result.status || 'PENDING';
  if (cloudExitCode !== 0) {
    return {
      outcome: 'fail',
      uploadStatus,
      message:
        `Test run failed (dcd exited ${cloudExitCode}, status ${result.status}). ` +
        `Check flow results for details: ${result.consoleUrl}`,
    };
  }
  if (result.status === 'PASSED') {
    return {
      outcome: 'pass',
      uploadStatus,
      message: 'Successfully completed test run.',
    };
  }
  if (result.status === 'FAILED' || result.status === 'CANCELLED') {
    return {
      outcome: 'fail',
      uploadStatus,
      message: `Test run ${result.status}. Check flow results for details: ${result.consoleUrl}`,
    };
  }
  return {
    outcome: 'warn',
    uploadStatus,
    message:
      `dcd reported success but the upload status is ${result.status}. ` +
      `Treating the run as passed: ${result.consoleUrl}`,
  };
}
