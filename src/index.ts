import { setFailed } from '@actions/core';
import { getParameters } from './methods/params';
import { execSync } from 'child_process';

const run = async (): Promise<void> => {
  try {
    const {
      additionalAppBinaryIds,
      additionalAppFiles,
      androidApiLevel,
      androidDevice,
      apiKey,
      apiUrl,
      appBinaryId,
      appFilePath,
      async,
      deviceLocale,
      downloadArtifacts,
      env,
      excludeFlows,
      excludeTags,
      googlePlay,
      includeTags,
      iOSVersion,
      iosDevice,
      maestroVersion,
      name,
      orientation,
      workspaceFolder,
    } = await getParameters();

    const params: Record<string, any> = {
      'additional-app-binary-ids': additionalAppBinaryIds,
      'additional-app-files': additionalAppFiles,
      'android-api-level': androidApiLevel,
      'android-device': androidDevice,
      'api-key': apiKey,
      'api-url': apiUrl,
      'app-binary-id': appBinaryId,
      'app-file': appFilePath,
      async,
      'device-locale': deviceLocale,
      'download-artifacts': downloadArtifacts,
      env,
      'exclude-flows': excludeFlows,
      'exclude-tags': excludeTags,
      flows: workspaceFolder,
      'google-play': googlePlay,
      'include-tags': includeTags,
      'ios-device': iosDevice,
      'ios-version': iOSVersion,
      'maestro-version': maestroVersion,
      name,
      orientation,
    };

    const paramsString = Object.keys(params).reduce((acc, key) => {
      return params[key] ? `${acc} --${key} "${params[key]}"` : acc;
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
