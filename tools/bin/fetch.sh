#!/usr/bin/env bash
set -euo pipefail

# Download and verify the pinned FFmpeg static builds.
cd "$(dirname "$0")"

base='https://ffmpeg.martin-riedl.de/redirect/latest/linux/amd64/release'

for name in ffmpeg ffprobe; do
	curl -fsSL "$base/$name.zip" -o "$name.zip"
	unzip -oq "$name.zip"
	chmod +x "$name"
	rm -f "$name.zip"
done

sha256sum -c CHECKSUMS
./ffmpeg -version | head -1
./ffprobe -version | head -1
