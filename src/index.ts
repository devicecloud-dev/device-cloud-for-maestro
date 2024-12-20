import { setFailed } from '@actions/core';
import { getParameters } from './methods/params';
import { execSync } from 'child_process';

const escapeShellValue = (value: string): string => {
  // Escape special characters that could cause shell interpretation issues
  return value.replace(/(["\\'$`!])/g, '\\$1');
};

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
      retry,
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
      retry,
    };

    let paramsString = Object.keys(params).reduce((acc, key) => {
      if (!params[key]) return acc;
      const value =
        typeof params[key] === 'string'
          ? escapeShellValue(params[key])
          : params[key];
      const needsQuotes =
        typeof value === 'string' &&
        !value.startsWith('"') &&
        (value.includes(' ') || value.includes('\\'));
      const finalValue = needsQuotes ? `"${value}"` : value;
      return `${acc} --${key} ${finalValue}`;
    }, '');

    if (env && env.length > 0) {
      env.forEach((e) => {
        let [key, value] = e.split('=');
        value = escapeShellValue(value);
        const needsQuotes =
          !value.startsWith('"') &&
          (value.includes(' ') || value.includes('\\'));
        if (needsQuotes) value = `"${value}"`;
        paramsString += ` --env ${key}=${value}`;
      });
    }

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
