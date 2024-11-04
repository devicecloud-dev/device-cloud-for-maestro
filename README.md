# Device Cloud Action

This action is a swap in replacement for the [Maestro Cloud Action](https://github.com/mobile-dev-inc/action-maestro-cloud). The readme is identical where practical to make the switch as straightforward as possible.

It lets you run your flows on [devicecloud.dev](https://devicecloud.dev) to save money and access extra features.

# Using the action

Add the following to your workflow. Note that you can use the `v1` tag if you want to keep using the latest version of the action, which will automatically resolve to all `v1.minor.patch` versions as they get published.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
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
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app/build/outputs/apk/debug/app-debug.apk
```

`app-file` should point to an x86 compatible APK file, either directly to the file or a glob pattern matching the file name. When using a pattern, the first matched file will be used.

# iOS

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: <app_name>.zip
```

`app-file` should point to an Apple silicon compatible Simulator .app build which has then been zipped, either directly to the file or a glob pattern matching the file name. When using a pattern, the first matched file will be used.

# Custom workspace location

By default, the action is looking for a `.maestro` folder with Maestro flows in the root directory of the project. If you would like to customize this behaviour, you can override it with a `workspace` argument:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    workspace: myFlows/
```

# Custom name

The run name will automatically be populated with the commit message.

If you want to override this behaviour and specify your own name, you can do so by setting the `name` argument:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    name: My Upload
```

# Run in async mode

If you don't want the action to wait until the Upload has been completed as is the default behaviour, set the `async` argument to `true`:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    async: true
```

# Adding environment variables

If you want to pass environment variables along with your upload, add a multiline `env` argument:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
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
- uses: devicecloud-dev/device-cloud-for-maestro@v1
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
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    android-api-level: 32
```

# Specifying iOS version

You can specify what **major** iOS Version to use when running in devicecloud.dev using the `ios-version` parameter.

The default iOS version is 17. [Refer to docs](https://docs.devicecloud.dev/getting-started/devices-configuration) for available iOS simulator versions.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    ios-version: 16
```

# Using an already uploaded App

You can use an already uploaded App binary in devicecloud.dev using the `app-binary-id` parameter.

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-binary-id: <your-app-binary-id>
```

# Specifying device orientation

You can specify the orientation of Android devices in degrees using the `orientation` parameter:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    orientation: 90 # Options: 0|90|180|270
```

# Setting device locale

You can set the device locale using ISO codes:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    device-locale: de_DE # Format: ISO-639-1_ISO-3166-1
```

# Additional app binaries

You can include additional app binaries either by file or by previously uploaded binary ID:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
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
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    download-artifacts: FAILED # Options: ALL|FAILED
```

Note: There is a $0.01 egress fee per result when using this feature.

# Specifying Maestro version

You can specify which version of Maestro to use (ALPHA feature):

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
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
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.apk
    android-device: pixel-6
```

## iOS Device

Specify an iOS device model to run your tests on:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: app.zip
    ios-device: iphone-14
```
