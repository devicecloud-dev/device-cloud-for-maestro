import { setFailed } from '@actions/core';
import { getParameters } from './methods/params';
import { execSync } from 'child_process';

const run = async (): Promise<void> => {
  try {
    const {
      apiKey,
      apiUrl,
      appFilePath,
      workspaceFolder,
      env,
      async,
      androidApiLevel,
      iOSVersion,
      includeTags,
      excludeTags,
      appBinaryId,
      androidDevice,
      iosDevice,
      excludeFlows,
      googlePlay,
      name,
    } = await getParameters();

    const params: Record<string, any> = {
      'app-file': appFilePath,
      flows: workspaceFolder,
      'api-key': apiKey,
      'app-binary-id': appBinaryId,
      'include-tags': includeTags,
      'exclude-tags': excludeTags,
      env,
      'api-url': apiUrl,
      async,
      'android-api-level': androidApiLevel,
      'ios-version': iOSVersion,
      'android-device': androidDevice,
      'ios-device': iosDevice,
      'exclude-flows': excludeFlows,
      'google-play': googlePlay,
      name,
    };

    const paramsString = Object.keys(params).reduce((acc, key) => {
      return params[key] ? `${acc} --${key} ${params[key]}` : acc;
    }, '');

    execSync(`npx --yes @devicecloud.dev/dcd cloud  ${paramsString} --quiet`, {
      stdio: 'inherit',
    });

    console.info('Successfully completed test run.');
  } catch (error) {
    if (typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed((error as Error).message);
    }
  }
};

run();
