# devicecloud.dev - Trigger Mobile App Test Run

This GitHub Action leverages devicecloud.dev to trigger a mobile app UI test.

## Installation

1. Navigate to the [GitHub Marketplace](https://github.com/marketplace/actions/dcd-trigger-mobile-app-test-run).
2. On the action page, click `Use latest version` button.
3. Follow the prompts from github to install the action.

## Configuration

Here is an example of how to set up the devicecloud.dev GitHub Action in your workflow file:

```yaml
name: devicecloud.dev Mobile App Test Run
on:
  push:
    branches: [production, staging]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: devicecloud.dev - Trigger Mobile App Test Run
        uses: devicecloud-dev/action-trigger-test-run@v1
        with:
          api-key: ${{ secrets.DCD_API_KEY }}
          app-file: path/to/build.apk
          workspace: path/to/workspace
          env: '{"VAR_1":"Some variable", "VAR_2":"A different variable"}'
```

In this example, this action will run whenever a push to the production or staging branch occurs.

### Storing Secrets

The `api-key` should be kept private. You can use GitHub secrets to protect it. To add a secret:

1. Navigate to your GitHub repository and click on the `Settings` tab.
2. Click on `Secrets` in the left sidebar.
3. Click `New repository secret`.
4. Enter `DCD_API_KEY` as the name for the secrets, and paste the corresponding key in the value field.

## Inputs

### `api-key`

**Required** - devicecloud.dev Secret Key, find this in your devicecloud.dev dashboard.
It follows the UUID schema, e.g. `85e67636-7652-45a8-94ac-e7cdd7e8f869`, however we recommend using Github Secrets for this parameter and provide as follows:

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
```

### `app-file`

**Required if binary-id is not specified** - App binary to run your flows against.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: /path/to/your_app.apk
```

### `app-binary-id`

**Required if app-file is not specified** - The ID of the app binary previously uploaded to Maestro Cloud.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-binary-id: your-app-binary-id
```

### `workspace`

**Required** - The path to the flow file or folder containing your flows.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    workspace: /path/to/flows
```

### `env`

**Required** - One or more environment variables to inject into your flows. The variables must be passed as stringified JSON in the form `{"VAR_1":"VAL_1","VAR_2":"VAL_2"}`

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    env: '{"VAR_1":"Some variable", "VAR_2":"A different variable"}'
```

### `android-api-level`

**Optional** - [Android only] Android API level to run your flow against. Options: `32`, `33`, `34`.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    android-api-level: 33
```

### `android-device`

**Optional** - [Android only] Android device to run your flow against. Options: `pixel-6`, `pixel-6a`, `pixel-6-pro`, `pixel-7`, `pixel-7-pro`, `generic-tablet`.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    android-device: pixel-6
```

### `async`

**Optional** - Wait for the results of the run asynchronously.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    async: true
```

### `exclude-flows`

**Optional** - Subdirectories to ignore when building the flow file list.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    exclude-flows: 'test/exclude-directory'
```

### `exclude-tags`

**Optional** - Flows which have these tags will be excluded from the run.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    exclude-tags: 'tag1,tag2'
```

### `google-play`

**Optional** - [Android only] Run your flow against Google Play devices.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    google-play: true
```

### `include-tags`

**Optional** - Only flows which have these tags will be included in the run.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    include-tags: 'tag3,tag4'
```

### `ios-device`

**Optional** - [iOS only] iOS device to run your flow against. Options: `iphone-12`, `iphone-12-mini`, `iphone-12-pro-max`, `iphone-13`, `iphone-13-mini`, `iphone-13-pro-max`, `iphone-14`, `iphone-14-plus`, `iphone-14-pro`, `iphone-14-pro-max`, `iphone-15`, `iphone-15-plus`, `iphone-15-pro`,

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    ios-device: iphone-14
```

### `ios-version`

**Optional** - [iOS only] iOS version to run your flow against. Options: `15`, `16`, `17`.

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    ios-version: 16
```

### `name`

**Optional** - A custom name for your upload (useful for tagging commits etc).

```yaml
---
- name: devicecloud.dev - Trigger Mobile App Test Run
  uses: dcd-com/action-trigger-test-run@v1
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    name: 'My Custom Upload Name'
```
