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

# The redirect serves the current release. Fail if it no longer matches the
# pinned version recorded in tools/SOURCES.md.
for name in ffmpeg ffprobe; do
	if ! "./$name" -version | head -1 | grep -q 'version 9\.1'; then
		echo "fetch.sh: $name is not version 9.1; update the pin" >&2
		exit 1
	fi
	"./$name" -version | head -1
done
