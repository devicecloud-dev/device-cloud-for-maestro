# Device Cloud Action

This action is a swap in replacement for the [Maestro Cloud Action](https://github.com/mobile-dev-inc/action-maestro-cloud). The readme is identical where practical to make the switch as straightforward as possible.

It lets you run your flows on [devicecloud.dev](https://devicecloud.dev) to save money and access extra features.

# Using the action

Add the following to your workflow. Note that you can use the `v2` tag if you want to keep using the latest version of the action, which will automatically resolve to all `v2.minor.patch` versions as they get published.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: <path_to_your_app_file>
```

# Triggers

Trigger this action on (1) pushes to your main branch and (2) pull requests opened against your main branch:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

If you need to use the `pull_request_target` trigger to support repo forks, check out the HEAD of the pull request to ensure that you're running the analysis against the changed code:

```yaml
on:
  push:
    branches: [main]
  pull_request_target:
    branches: [main]
jobs:
  run-maestro-on-dcd:
    name: Run Flows on devicecloud.dev
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.pull_request.head.sha }} # Checkout PR HEAD
```

# Android

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app/build/outputs/apk/debug/app-debug.apk
```

`app-file` should point to an APK file, either directly to the file or a glob pattern matching the file name. When using a pattern, the first matched file will be used.

# iOS

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: <app_name>.zip
```

`app-file` should point to an Apple silicon compatible Simulator .app build, or a zipped (`.zip`) bundle of a .app build; either directly to the file or a glob pattern matching the file name. When using a pattern, the first matched file will be used.

# Custom workspace location

By default, the action is looking for a `.maestro` folder with Maestro flows in the root directory of the project. If you would like to customize this behaviour, you can override it with either a `flows` or `workspace` argument:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    flows: myFlows/  # or workspace: myFlows/
```

Both `flows` and `workspace` parameters serve the same purpose. If both are provided, `flows` takes precedence.

# Custom name

The run name will automatically be populated with the commit message.

If you want to override this behaviour and specify your own name, you can do so by setting the `name` argument:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    name: My Upload
```

# Run in async mode

If you don't want the action to wait until the Upload has been completed as is the default behaviour, set the `async` argument to `true`:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    async: true
```

# Adding environment variables

If you want to pass environment variables along with your upload, add a multiline `env` argument:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    env: |
      USERNAME=<username>
      PASSWORD=<password>
```

# Using tags

You can use Maestro [Tags](https://maestro.mobile.dev/cli/tags) to filter which Flows to send to device cloud:

You can either pass a single value, or comma-separated (`,`) values.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    include-tags: dev, pull-request
    exclude-tags: excludeTag
```

# Specifying Android API Level

You can specify what Android API level to use when running in devicecloud.dev using the `android-api-level` parameter.

The default API level is 34. [Refer to docs](https://docs.devicecloud.dev/getting-started/devices-configuration) for available Android emulator API levels.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    android-api-level: 32
```

# Specifying iOS version

You can specify what **major** iOS Version to use when running in devicecloud.dev using the `ios-version` parameter.

The default iOS version is 17. [Refer to docs](https://docs.devicecloud.dev/getting-started/devices-configuration) for available iOS simulator versions.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    ios-version: 16
```

# Using an already uploaded App

You can use an already uploaded App binary in devicecloud.dev using the `app-binary-id` parameter.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-binary-id: <your-app-binary-id>
```

# Specifying device orientation

You can specify the orientation of Android devices in degrees using the `orientation` parameter:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    orientation: 90 # Options: 0|90|180|270
```

# Setting device locale

You can set the device locale using ISO codes:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    device-locale: de_DE # Format: ISO-639-1_ISO-3166-1
```

# Additional app binaries

You can include additional app binaries either by file or by previously uploaded binary ID:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    additional-app-files: |
      second-app.apk
      third-app.apk
    additional-app-binary-ids: |
      binary-id-1
      binary-id-2
```

# Downloading artifacts

You can download logs, screenshots and videos for test results (BETA feature):

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    download-artifacts: FAILED # Options: ALL|FAILED
```

Note: There is a $0.01 egress fee per result when using this feature.

# Specifying Maestro version

You can specify which version of Maestro to use (ALPHA feature):

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    maestro-version: 1.39.0
```

# Specifying Device Models

You can target specific device models for your tests using the `android-device` or `ios-device` parameters.

See a full list of available device models [here](https://docs.devicecloud.dev/getting-started/devices-configuration).

## Android Device

Specify an Android device model to run your tests on:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    android-device: pixel-6
```

## iOS Device

Specify an iOS device model to run your tests on:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    ios-device: iphone-14
```

# Retry parameter

The `retry` parameter allows you to specify the number of times to retry the run if it fails. This is the same as pressing retry in the UI, and it will deduct credits from your account. Max is 3 retries.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    retry: 3
```

# Report Format

You can generate test reports in specific formats using the `report` parameter:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    report: junit # Options: junit|html
```

# Ignore SHA Check

You can bypass the binary hash check using the `ignore-sha-check` parameter (not recommended):

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    ignore-sha-check: true
```

# Google Play Devices

For Android tests, you can run your flows against Google Play devices:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    google-play: true
```

# Runner Types (Experimental)

You can specify a custom runner type using the `runner-type` parameter:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    runner-type: m4
```

Note: Anything other than the default runner type will incur premium pricing. See the [documentation](https://docs.devicecloud.dev/reference/runner-type) for more information.

# Custom config file

You can specify a custom path to your Maestro config file. Defaults to looking for config.yaml in the workspace folder.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    config: path/to/my-maestro-config.yaml
```

# Using Action Outputs

The action provides several outputs that you can use in subsequent steps of your workflow. Here's how to use them:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: devicecloud-dev/device-cloud-for-maestro@v2
        id: devicecloud  # Important: Add an ID to reference the step
        with:
          api-key: ${{ secrets.DCD_API_KEY }}
          app-file: app.apk

      # Example: Post test results to a Slack channel
      - name: Post Test Results
        if: always()  # Run even if tests fail
        uses: slackapi/slack-github-action@v1.24.0
        with:
          channel-id: 'test-results'
          slack-message: |
            Test Run Status: ${{ steps.devicecloud.outputs.DEVICE_CLOUD_UPLOAD_STATUS }}
            View Results: ${{ steps.devicecloud.outputs.DEVICE_CLOUD_CONSOLE_URL }}
        env:
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}

      # Example: Save test results as artifacts
      - name: Save Test Results
        if: always()
        run: |
          echo '${{ steps.devicecloud.outputs.DEVICE_CLOUD_FLOW_RESULTS }}' > test-results.json

      # Example: Use app binary ID in subsequent steps
      - name: Use App Binary ID
        if: success()
        run: |
          echo "App Binary ID: ${{ steps.devicecloud.outputs.DEVICE_CLOUD_APP_BINARY_ID }}"
```

Available outputs:
- `DEVICE_CLOUD_CONSOLE_URL`: URL to view the test results in the Device Cloud console
- `DEVICE_CLOUD_FLOW_RESULTS`: JSON array containing results for each flow, including name and status
- `DEVICE_CLOUD_UPLOAD_STATUS`: Status of the test run (PENDING, RUNNING, PASSED, FAILED, CANCELLED)
- `DEVICE_CLOUD_APP_BINARY_ID`: ID of the uploaded app binary in Device Cloud

# JSON Output File

You can write the test results to a JSON file for easier processing or archiving:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    json-file: true
```

This will create a file named `<run_name>_dcd.json` or `<upload_id>_dcd.json` if no name is provided, containing all test results and metadata.

Example JSON file content:
```json
{
  "uploadId": "abcd1234-5678-efgh-9012-ijklmnopqrst",
  "consoleUrl": "https://console.devicecloud.dev/results?upload=abcd1234-5678-efgh-9012-ijklmnopqrst",
  "appBinaryId": "app-binary-5678",
  "status": "PASSED",
  "flowResults": [
    {
      "name": "login_test",
      "status": "PASSED"
    },
    {
      "name": "checkout_flow",
      "status": "PASSED"
    }
  ]
}
```

# All Available Options

Here's a complete example showing all available options:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    # Required
    api-key: ${{ secrets.DCD_API_KEY }}
    
    # App Configuration
    app-file: app.apk  # or app-binary-id: <id>
    additional-app-files: |
      second-app.apk
      third-app.apk
    additional-app-binary-ids: |
      binary-id-1
      binary-id-2
    
    # Device Configuration
    android-device: pixel-6  # pixel-6|pixel-6-pro|pixel-7|pixel-7-pro|generic-tablet
    android-api-level: 34   # 29-35
    ios-device: iphone-14   # iphone-14|iphone-14-pro|iphone-15|iphone-15-pro|iphone-16|iphone-16-plus|iphone-16-pro|iphone-16-pro-max|ipad-pro-6th-gen
    ios-version: 17        # 16|17|18|26
    device-locale: en_US   # ISO-639-1_ISO-3166-1
    orientation: 0         # 0|90|180|270 (Android only)
    google-play: false     # Use Google Play devices (Android)

    # Flow Configuration
    flows: myFlows/       # or workspace: myFlows/ (flows takes precedence)
    exclude-flows: |
      tests/experimental
    include-tags: smoke,critical
    exclude-tags: wip
    
    # Test Configuration
    maestro-version: 1.39.5
    env: |
      KEY1=value1
      KEY2=value2
    name: Custom Run Name
    retry: 3
    report: junit         # junit|html
    
    # Execution Options
    async: false
    quiet: false
    ignore-sha-check: false
    download-artifacts: FAILED  # ALL|FAILED
    json-file: true            # Write test results to a JSON file
    api-url: https://api.devicecloud.dev
    config: path/to/maestro-config.yaml
    runner-type: default   # Experimental: m1|m4
```
