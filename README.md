# Scan Docker Tags Action

Scans the [Microsoft Container Registry](https://github.com/microsoft/containerregistry) for images and tags. This allows you to build new images based on Microsoft's docker images on a regular basis.

Inspired by the [scan-docker-tags-action](https://github.com/dhet/scan-docker-tags-action).


## Example

This example workflow scans for dotnet/sdk images with tags that match the last 3 major versions and all of their minor versions every Monday at 6 AM. The output is picked up in another build step that prints each image and tag with the matrix strategy.

```yml
name: Scan Images
on:
  schedule:
    - cron: '0 6 * * 1'

jobs:
  scan:
    name: List Recent Updates
    runs-on: ubuntu-latest
    outputs: 
      images: ${{ steps.scan.outputs.images }}
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Scan Docker Repository
        uses: divinebovine/scan-mcr-docker-tags-action@v0.0.1
        with:
          image: dotnet/sdk
          tag-regex: ^\d+\.\d+-(alpine|focal)$
          version-limit: 3
        id: scan
  build:
    needs: scan
    runs-on: ubuntu-latest
    strategy:
      matrix:
        image: ${{ fromJson(needs.scan.outputs.images) }}
    steps:
      - name: Test
        run : echo dotnet:${{matrix.image}}
```

## Required Inputs

|Parameter|Description
|---|---
|`images`|The image or an array of images to scan (sans tag), e.g. `dotnet/sdk`, `["dotnet/sdk", "dotnet/aspnet"]`.

## Optional Inputs
|Parameter|Description|Default
|---|---|---
|`tag-regex`|A regular expression for filtering tags. E.g. `\d+\.\d+$` matches `0.10`, `1.2`, `1.12.123`, etc.| `.*`
|`repo-url`|The URL of the Docker registry.|`https://mcr.microsoft.com`
|`version-limit`|The number of major versions, starting from the latest, to limit the results.| `'*'` which includes every tag


## Outputs
The only output this action exposes is the `images` output. `images` is a comma-separated list of all image tags that match the
regular expression and are limited by the version limit.
