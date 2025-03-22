import { setFailed, setOutput } from '@actions/core';
import { getParameters } from './methods/params';
import { spawn } from 'child_process';

const dcdVersionString = '@devicecloud.dev/dcd@>=3.3.6';

const escapeShellValue = (value: string): string => {
  // Escape special characters that could cause shell interpretation issues
  return value.replace(/(["\\'$`!\s\[\]{}()&|;<>*?#^~])/g, '\\$1');
};

interface TestResult {
  name: string;
  status: 'PASSED' | 'FAILED' | 'CANCELLED' | 'PENDING' | 'RUNNING';
}

interface StatusResponse {
  status: 'PASSED' | 'FAILED' | 'CANCELLED' | 'PENDING' | 'RUNNING';
  tests: TestResult[];
  consoleUrl?: string;
  appBinaryId?: string;
}

const executeCommand = (
  command: string,
  log: boolean = true
): Promise<{ output: string; exitCode: number }> => {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    let output = '';

    const process = spawn(cmd, args, { shell: true });

    process.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      if (log) {
        console.info(chunk);
      }
    });

    process.stderr.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      if (log) {
        console.error(chunk);
      }
    });

    process.on('close', (code) => {
      resolve({ output, exitCode: code ?? 0 });
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
};

const getTestStatus = async (
  uploadId: string,
  apiKey: string,
  apiUrl?: string
): Promise<StatusResponse | null> => {
  try {
    let command = `npx --yes "${dcdVersionString}" status --json --upload-id ${uploadId} --api-key ${escapeShellValue(
      apiKey
    )}`;
    if (apiUrl) {
      command += ` --api-url ${escapeShellValue(apiUrl)}`;
    }
    const { output } = await executeCommand(command, false);
    return JSON.parse(output);
  } catch (error) {
    console.warn('Failed to get test status:', error);
    return null;
  }
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
      config,
      deviceLocale,
      downloadArtifacts,
      env,
      excludeFlows,
      excludeTags,
      googlePlay,
      ignoreShaCheck,
      includeTags,
      iOSVersion,
      iosDevice,
      maestroVersion,
      name,
      orientation,
      report,
      retry,
      workspaceFolder,
      x86Arch,
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
      config,
      'device-locale': deviceLocale,
      'download-artifacts': downloadArtifacts,
      'exclude-flows': excludeFlows,
      'exclude-tags': excludeTags,
      flows: workspaceFolder,
      'google-play': googlePlay,
      'ignore-sha-check': ignoreShaCheck,
      'include-tags': includeTags,
      'ios-device': iosDevice,
      'ios-version': iOSVersion,
      'maestro-version': maestroVersion,
      name,
      orientation,
      report,
      retry,
      'x86-arch': x86Arch,
    };

    let paramsString = Object.keys(params).reduce((acc, key) => {
      if (!params[key]) return acc;
      const value =
        typeof params[key] === 'string'
          ? escapeShellValue(params[key])
          : params[key];
      return `${acc} --${key} ${value}`;
    }, '');

    if (env && env.length > 0) {
      env.forEach((e) => {
        let [key, ...rest] = e.split('=');
        let value = rest.join('=');
        if (value.startsWith('"') && value.endsWith('"')) {
          // remove quotes so they dont get escaped
          value = value.slice(1, -1);
        }
        paramsString += ` --env ${key}=${escapeShellValue(value)}`;
      });
    }

    // Execute the test command and capture the upload ID
    let uploadId: string | null = null;
    let testOutput = '';

    try {
      const { output, exitCode } = await executeCommand(
        `npx --yes "${dcdVersionString}" cloud ${paramsString} --quiet`
      );
      testOutput = output;

      if (exitCode === 1) {
        throw new Error(
          'DeviceCloud CLI failed to run - check your parameters or contact support'
        );
      }
    } finally {
      uploadId =
        testOutput?.match(
          /https:\/\/console\.devicecloud\.dev\/results\?upload=([a-zA-Z0-9-]+)/
        )?.[1] || null;
    }

    if (!uploadId) {
      throw new Error('Failed to get upload ID from console URL');
    }

    // Get the test status and results
    const result = await getTestStatus(uploadId, apiKey, apiUrl);

    if (result) {
      // Set outputs based on the status results
      setOutput('DEVICE_CLOUD_CONSOLE_URL', result.consoleUrl || '');
      setOutput('DEVICE_CLOUD_APP_BINARY_ID', result.appBinaryId || '');
      setOutput('DEVICE_CLOUD_UPLOAD_STATUS', result.status || 'PENDING');

      // Format flow results to match expected structure
      const flowResults = (result.tests || []).map((test: TestResult) => ({
        name: test.name,
        status: test.status,
      }));
      setOutput(
        'DEVICE_CLOUD_FLOW_RESULTS',
        JSON.stringify(flowResults, null, 2)
      );

      if (result.status === 'PASSED') {
        console.info('Successfully completed test run.');
      } else if (result.status === 'FAILED') {
        setFailed(
          `Test run failed. Check flow results for details: ${result.consoleUrl}`
        );
      }
    } else {
      setOutput('DEVICE_CLOUD_UPLOAD_STATUS', 'ERROR');
      setOutput('DEVICE_CLOUD_FLOW_RESULTS', '[]');
      throw new Error('Failed to get test status');
    }
  } catch (error) {
    if (typeof error === 'string') {
      setFailed(error);
    } else {
      setFailed((error as Error).message);
    }
  }
};

run();
