#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p dist

bun build bin/ffmpeg-tui.ts --compile --target bun-linux-x64 --outfile dist/ffmpeg-tui-linux-x64
bun build bin/ffmpeg-tui.ts --compile --target bun-linux-arm64 --outfile dist/ffmpeg-tui-linux-arm64

sha256sum dist/ffmpeg-tui-linux-x64 dist/ffmpeg-tui-linux-arm64
