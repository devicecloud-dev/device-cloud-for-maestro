# Device Cloud Action

A drop-in replacement for the [Maestro Cloud Action](https://github.com/mobile-dev-inc/action-maestro-cloud). Run your Maestro flows on [devicecloud.dev](https://devicecloud.dev) to save money and access extra features.

## Quick Start

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: <path_to_your_app_file>
```

## Documentation

Full documentation including all inputs, outputs, and usage examples is available at:

**[docs.devicecloud.dev/ci-cd/github-actions](https://docs.devicecloud.dev/ci-cd/github-actions)**

## Async runs + PR checks (save CI minutes)

By default the action waits for your run to finish, so the job (and your GitHub
Actions minutes) stays billed for the whole suite. Set `async: true` to submit
the run and exit immediately:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: <path_to_your_app_file>
    async: true
```

To still gate your PR on the result, install the **DeviceCloud GitHub App** and
connect it to your org in DeviceCloud → Settings → Integrations. DeviceCloud then
posts a `DeviceCloud / Mobile E2E` check on the commit/PR — `in progress` while
the suite runs, then pass/fail when it completes — with a "Re-run failed tests"
button. Make it a required status check in branch protection to block merges on
failures. No `permissions: checks: write` is needed in your workflow; the App
posts the check.

## Migrating from Maestro Cloud

Replace the `uses` line in your workflow:

```yaml
# Before
- uses: mobile-dev-inc/action-maestro-cloud@v2

# After
- uses: devicecloud-dev/device-cloud-for-maestro@v2
```

All inputs are compatible. Update your API key secret from `MCLOUD_API_KEY` to `DCD_API_KEY` (or any name you choose).
