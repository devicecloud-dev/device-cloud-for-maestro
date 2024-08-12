import * as core from '@actions/core';

export type Params = {
  apiKey: string;
  apiUrl: string;
  appFilePath: string;
  workspaceFolder: string | null;
  env?: { [key: string]: string };
  async?: boolean;
  androidApiLevel?: number;
  iOSVersion?: number;
  includeTags: string[];
  excludeTags: string[];
  appBinaryId: string;
  androidDevice: string | null;
  excludeFlows: string;
  googlePlay: boolean;
  iosDevice: string | null;
  name?: string;
};

function getAndroidApiLevel(apiLevel?: string): number | undefined {
  return apiLevel ? +apiLevel : undefined;
}

function getIOSVersion(iosVersion?: string): number | undefined {
  return iosVersion ? +iosVersion : undefined;
}

function parseTags(tags?: string): string[] {
  if (tags === undefined || tags === '') return [];

  if (tags.includes(',')) {
    const arrayTags = tags.split(',').map((it) => it.trim());

    if (!Array.isArray(arrayTags)) throw new Error('tags must be an Array.');

    return arrayTags;
  }

  return [tags];
}

function parseAndroidDevice(device?: string): string | null {
  if (device === undefined || device === '') return null;

  if (
    [
      'pixel-6',
      'pixel-6a',
      'pixel-6-pro',
      'pixel-7',
      'pixel-7-pro',
      'generic-tablet',
    ].includes(device)
  ) {
    return device;
  }

  throw new Error(`Invalid android device: ${device}`);
}
function parseIOSDevice(device?: string): string | null {
  if (device === undefined || device === '') return null;

  if (
    [
      'iphone-12',
      'iphone-12-mini',
      'iphone-12-pro-max',
      'iphone-13',
      'iphone-13-mini',
      'iphone-13-pro-max',
      'iphone-14',
      'iphone-14-plus',
      'iphone-14-pro',
      'iphone-14-pro-max',
      'iphone-15',
      'iphone-15-plus',
      'iphone-15-pro',
      'iphone-15-pro-max',
      'ipad-pro-6th-gen',
    ].includes(device)
  ) {
    return device;
  }

  throw new Error(`Invalid ios device: ${device}`);
}

export async function getParameters(): Promise<Params> {
  const apiUrl =
    core.getInput('api-url', { required: false }) ||
    'https://api.devicecloud.dev';
  const apiKey = core.getInput('api-key', { required: true });
  const name = core.getInput('name', { required: false });
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

  if (!(appFilePath !== '') !== (appBinaryId !== '')) {
    throw new Error('Either app-file or app-binary-id must be used');
  }

  var env: { [key: string]: string } = {};
  env = core
    .getMultilineInput('env', { required: false })
    .map((it) => {
      const parts = it.split('=');

      if (parts.length < 2) {
        throw new Error(`Invalid env parameter: ${it}`);
      }

      return { key: parts[0], value: parts.slice(1).join('=') };
    })
    .reduce((map, entry) => {
      map[entry.key] = entry.value;
      return map;
    }, env);

  const androidApiLevel = getAndroidApiLevel(androidApiLevelString);
  const iOSVersion = getIOSVersion(iOSVersionString);

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
  };
}
