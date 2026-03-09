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

## Migrating from Maestro Cloud

Replace the `uses` line in your workflow:

```yaml
# Before
- uses: mobile-dev-inc/action-maestro-cloud@v2

# After
- uses: devicecloud-dev/device-cloud-for-maestro@v2
```

All inputs are compatible. Update your API key secret from `MCLOUD_API_KEY` to `DCD_API_KEY` (or any name you choose).
