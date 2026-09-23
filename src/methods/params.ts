import * as github from '@actions/github';
import * as core from '@actions/core';
import { resolveAppFile } from './app-file';

export type Params = {
  apiKey: string;
  apiUrl: string;
  appFilePath: string;
  workspaceFolder: string | null;
  env?: string[];
  async?: boolean;
  androidApiLevel?: number;
  iOSVersion?: number;
  includeTags: string[] | null;
  excludeTags: string[] | null;
  appBinaryId: string;
  androidDevice: string | null;
  excludeFlows: string;
  googlePlay: boolean;
  iosDevice: string | null;
  name?: string;
  deviceLocale?: string;
  downloadArtifacts?: 'ALL' | 'FAILED';
  maestroVersion?: string;
  orientation?: 0 | 90 | 180 | 270;
  retry?: number;
  ignoreShaCheck?: boolean;
  report?: 'junit' | 'html';
  config?: string;
  runnerType?: string;
  renderEngine?: string;
  jsonFile?: boolean;
  debug?: boolean;
  moropoV1ApiKey?: string;
  useBeta?: boolean;
  maestroChromeOnboarding?: boolean;
  androidNoSnapshot?: boolean;
  disableAnimations?: boolean;
  githubContext?: string[];
};

function getAndroidApiLevel(apiLevel?: string): number | undefined {
  return apiLevel ? +apiLevel : undefined;
}

function getIOSVersion(iosVersion?: string): number | undefined {
  return iosVersion ? +iosVersion : undefined;
}

function parseTags(tags?: string): string[] | null {
  if (tags === undefined || tags === '' || tags === null || tags.length === 0)
    return null;

  if (tags.includes(',')) {
    const arrayTags = tags.split(',').map((it) => it.trim());

    if (!Array.isArray(arrayTags)) throw new Error('tags must be an Array.');

    return arrayTags;
  }

  return [tags];
}

function parseAndroidDevice(device?: string): string | null {
  if (device === undefined || device === '') return null;

  return device;
}

function parseIOSDevice(device?: string): string | null {
  if (device === undefined || device === '') return null;

  return device;
}

function getPullRequestTitle(): string | undefined {
  const pullRequestTitle = github.context.payload.pull_request?.title;
  if (pullRequestTitle === undefined) return undefined;
  return `${pullRequestTitle}`;
}

function getInferredName(): string {
  const pullRequestTitle = getPullRequestTitle();
  if (pullRequestTitle) return pullRequestTitle;

  if (github.context.eventName === 'push') {
    const pushPayload = github.context.payload;
    const commitMessage = pushPayload.head_commit?.message;
    if (commitMessage) return commitMessage;
  }

  return github.context.sha;
}

/**
 * `checkName` names the GitHub check this run posts. It is appended to the
 * backend's base name ("DeviceCloud / iOS"), which is what lets a PR that runs
 * iOS and Android as two submissions carry two checks that branch protection
 * can require separately — GitHub matches required checks by name, so two runs
 * sharing one name collapse into a single gate that follows whichever finished
 * last. Keep it constant for a given job; a value that varies per commit can
 * never be a required check.
 */
function getGithubContextMetadata(checkName?: string): string[] {
  const ctx = github.context;
  const pr = ctx.payload.pull_request;

  const rawRef = pr?.head?.ref ?? ctx.ref;
  const branch = rawRef?.replace(/^refs\/heads\//, '') ?? '';

  // On pull_request events ctx.sha is a throwaway *merge* commit; a GitHub
  // check (and the developer-visible commit) must use the PR's head sha.
  const headSha = pr?.head?.sha ?? ctx.sha;

  const pairs: string[] = [
    `gh_sha=${headSha}`,
    `gh_run_id=${ctx.runId}`,
    `gh_repo=${ctx.repo.owner}/${ctx.repo.repo}`,
  ];

  if (branch) pairs.push(`gh_branch=${branch}`);
  if (checkName) pairs.push(`gh_check_name=${checkName}`);
  if (pr) {
    pairs.push(`gh_pr_number=${pr.number}`);
    if (pr.html_url) pairs.push(`gh_pr_url=${pr.html_url}`);
  }

  return pairs;
}

function parseOrientation(
  orientation?: string
): 0 | 90 | 180 | 270 | undefined {
  if (!orientation) return undefined;
  const value = parseInt(orientation);
  if ([0, 90, 180, 270].includes(value)) {
    return value as 0 | 90 | 180 | 270;
  }
  throw new Error(
    `Invalid orientation: ${orientation}. Must be 0, 90, 180, or 270`
  );
}

function parseDownloadArtifacts(value?: string): 'ALL' | 'FAILED' | undefined {
  if (!value) return undefined;
  if (value !== 'ALL' && value !== 'FAILED') {
    throw new Error(
      `Invalid download-artifacts value: ${value}. Must be ALL or FAILED`
    );
  }
  return value;
}

/**
 * app-file as the CLI should get it: a glob is resolved to its first match
 * (see resolveAppFile), and the pick is logged so it's visible in the run.
 */
function getAppFilePath(appFile: string): string {
  const { path, matches } = resolveAppFile(appFile);
  if (matches.length > 1) {
    const shown = matches.slice(0, 5).join(', ');
    const more = matches.length > 5 ? `, and ${matches.length - 5} more` : '';
    core.warning(
      `app-file "${appFile}" matched ${matches.length} paths (${shown}${more}); ` +
        `using the first: ${path}`
    );
  } else if (matches.length === 1) {
    core.info(`app-file "${appFile}" matched ${path}`);
  }
  return path;
}

export async function getParameters(): Promise<Params> {
  const apiUrl =
    core.getInput('api-url', { required: false }) ||
    'https://api.devicecloud.dev';
  const apiKey = core.getInput('api-key', { required: true });
  const name = core.getInput('name', { required: false }) || getInferredName();

  // Support both 'flows' and 'workspace' inputs (flows takes precedence if both are provided)
  const flowsInput = core.getInput('flows', { required: false });
  const workspaceInput = core.getInput('workspace', { required: false });
  const workspaceFolder = flowsInput || workspaceInput;

  const async = core.getInput('async', { required: false }) === 'true';
  const androidApiLevelString = core.getInput('android-api-level', {
    required: false,
  });
  const iOSVersionString = core.getInput('ios-version', { required: false });
  const includeTags = parseTags(
    core.getInput('include-tags', { required: false })
  );
  const excludeTags = parseTags(
    core.getInput('exclude-tags', { required: false })
  );

  const appFileInput = core.getInput('app-file', { required: false });
  const appBinaryId = core.getInput('app-binary-id', { required: false });

  const androidDevice = parseAndroidDevice(
    core.getInput('android-device', { required: false })
  );
  const iosDevice = parseIOSDevice(
    core.getInput('ios-device', { required: false })
  );
  const excludeFlows = core.getInput('exclude-flows', { required: false });
  const googlePlay =
    core.getInput('google-play', { required: false }) === 'true';

  const deviceLocale = core.getInput('device-locale', { required: false });
  const downloadArtifacts = parseDownloadArtifacts(
    core.getInput('download-artifacts', { required: false })
  );
  const maestroVersion = core.getInput('maestro-version', { required: false });
  const orientation = parseOrientation(
    core.getInput('orientation', { required: false })
  );

  const ignoreShaCheck =
    core.getInput('ignore-sha-check', { required: false }) === 'true';

  const report = core.getInput('report', { required: false }) as
    | 'junit'
    | 'html'
    | undefined;
  if (report && report !== 'junit' && report !== 'html') {
    throw new Error('Report format must be either "junit" or "html"');
  }

  const config = core.getInput('config', { required: false });
  const runnerType = core.getInput('runner-type', { required: false });
  const renderEngine = core.getInput('render-engine', { required: false });
  const jsonFile = core.getInput('json-file', { required: false }) === 'true';
  const debug = core.getInput('debug', { required: false }) === 'true';
  const moropoV1ApiKey = core.getInput('moropo-v1-api-key', {
    required: false,
  });
  const useBeta = core.getInput('use-beta', { required: false }) === 'true';

  const checkName = core.getInput('check-name', { required: false }).trim();
  const includeGithubContext =
    core.getInput('include-github-context', { required: false }) !== 'false';
  const githubContext = includeGithubContext
    ? getGithubContextMetadata(checkName)
    : undefined;
  if (checkName && !includeGithubContext) {
    // Without the context there is no sha to post against, so no check at all —
    // say so rather than letting the input look like it did something.
    core.warning(
      'check-name is ignored because include-github-context is false: with no ' +
        'commit context attached, DeviceCloud posts no check on this run.'
    );
  }

  const maestroChromeOnboarding = core.getInput('maestro-chrome-onboarding', { required: false }) === 'true';
  const androidNoSnapshot = core.getInput('android-no-snapshot', { required: false }) === 'true';
  const disableAnimations = core.getInput('disable-animations', { required: false }) === 'true';

  if (!(appFileInput !== '') !== (appBinaryId !== '')) {
    throw new Error('Either app-file or app-binary-id must be used');
  }
  const appFilePath = getAppFilePath(appFileInput);

  const env = core.getMultilineInput('env', { required: false });

  const androidApiLevel = getAndroidApiLevel(androidApiLevelString);
  const iOSVersion = getIOSVersion(iOSVersionString);

  const retry =
    parseInt(core.getInput('retry', { required: false })) || undefined;

  return {
    apiUrl,
    apiKey,
    appFilePath,
    workspaceFolder,
    env,
    async,
    androidApiLevel,
    iOSVersion,
    includeTags,
    excludeTags,
    appBinaryId,
    name,
    androidDevice,
    iosDevice,
    excludeFlows,
    googlePlay,
    deviceLocale,
    downloadArtifacts,
    maestroVersion,
    orientation,
    retry,
    ignoreShaCheck,
    report,
    config,
    runnerType,
    renderEngine,
    jsonFile,
    debug,
    moropoV1ApiKey,
    useBeta,
    maestroChromeOnboarding,
    androidNoSnapshot,
    disableAnimations,
    githubContext,
  };
}
