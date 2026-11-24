# Pinned tool sources

Check date: 2026-11-24

## FFmpeg

Version: 9.1 "Gauss". Released 2026-11-20.
Official source: https://ffmpeg.org/download.html
Release tag: https://github.com/FFmpeg/FFmpeg/releases/tag/n9.1
Binary source: https://ffmpeg.martin-riedl.de/redirect/latest/linux/amd64/release/ffmpeg.zip
Probe source: https://ffmpeg.martin-riedl.de/redirect/latest/linux/amd64/release/ffprobe.zip

The binaries come from a third-party static build. FFmpeg provides source code only.
The checksums are in tools/bin/CHECKSUMS. The generator records the version it checked.

## Cache

The .cache directory holds real output from the pinned binaries:
ffmpeg-help.txt, ffmpeg-filters.txt, ffmpeg-encoders.txt, ffmpeg-decoders.txt,
ffmpeg-muxers.txt, ffmpeg-demuxers.txt, ffmpeg-protocols.txt, ffmpeg-hwaccels.txt,
ffmpeg-pix_fmts.txt, ffmpeg-sample_fmts.txt, ffmpeg-version.txt.
