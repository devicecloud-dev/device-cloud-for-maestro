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

### One check per job

If a PR runs more than once — iOS and Android as separate jobs, say — give each
run a `check-name` so they don't both post a check with the same name:

```yaml
- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: build/MyApp.app.zip
    async: true
    check-name: iOS        # -> a check called "DeviceCloud / iOS"

- uses: devicecloud-dev/device-cloud-for-maestro@v2
  with:
    api-key: ${{ secrets.DCD_API_KEY }}
    app-file: build/app.apk
    async: true
    check-name: Android    # -> a check called "DeviceCloud / Android"
```

Each one can then be required separately in branch protection. Without it both
runs post the same check name, GitHub treats them as one required check, and the
gate follows whichever run finished last — a passing Android run can clear a gate
the failing iOS run should have held. Keep the value fixed for a given job:
GitHub matches required checks by name, so a name that changes per commit can
never be required.

## Migrating from Maestro Cloud

Replace the `uses` line in your workflow:

```yaml
# Before
- uses: mobile-dev-inc/action-maestro-cloud@v2

# After
- uses: devicecloud-dev/device-cloud-for-maestro@v2
```

Most inputs carry over unchanged. These Maestro Cloud inputs are not supported and are ignored (GitHub warns about them as unexpected inputs): `project-id`, `mapping-file`, `timeout`, `branch` (the branch is attached automatically), and `device-model` / `device-os`, for which use `ios-device` / `ios-version` or `android-device` / `android-api-level`. Update your API key secret from `MCLOUD_API_KEY` to `DCD_API_KEY` (or any name you choose).
