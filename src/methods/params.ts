import * as github from '@actions/github';
import * as core from '@actions/core';

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
  additionalAppBinaryIds: string[] | null;
  additionalAppFiles: string[] | null;
  deviceLocale?: string;
  downloadArtifacts?: 'ALL' | 'FAILED';
  maestroVersion?: string;
  orientation?: 0 | 90 | 180 | 270;
  retry?: number;
  ignoreShaCheck?: boolean;
  report?: 'junit' | 'html';
  x86Arch?: boolean;
  config?: string;
  runnerType?: string;
  jsonFile?: boolean;
  skipChromeOnboarding?: boolean;
  moropoV1ApiKey?: string;
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

export async function getParameters(): Promise<Params> {
  const apiUrl =
    core.getInput('api-url', { required: false }) ||
    'https://api.devicecloud.dev';
  const apiKey = core.getInput('api-key', { required: true });
  const name = core.getInput('name', { required: false }) || getInferredName();
  const workspaceFolder = core.getInput('workspace', { required: false });
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

  const appFilePath = core.getInput('app-file', { required: false });
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

  const additionalAppBinaryIds = parseTags(
    core.getInput('additional-app-binary-ids', { required: false })
  );
  const additionalAppFiles = parseTags(
    core.getInput('additional-app-files', { required: false })
  );
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

  const x86Arch = core.getInput('x86-arch', { required: false }) === 'true';
  const config = core.getInput('config', { required: false });
  const runnerType = core.getInput('runner-type', { required: false });
  const jsonFile = core.getInput('json-file', { required: false }) === 'true';
  const skipChromeOnboarding =
    core.getInput('skip-chrome-onboarding', { required: false }) === 'true';
  const moropoV1ApiKey = core.getInput('moropo-v1-api-key', {
    required: false,
  });

  if (!(appFilePath !== '') !== (appBinaryId !== '')) {
    throw new Error('Either app-file or app-binary-id must be used');
  }

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
    additionalAppBinaryIds,
    additionalAppFiles,
    deviceLocale,
    downloadArtifacts,
    maestroVersion,
    orientation,
    retry,
    ignoreShaCheck,
    report,
    x86Arch,
    config,
    runnerType,
    jsonFile,
    skipChromeOnboarding,
    moropoV1ApiKey,
  };
}
