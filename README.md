# FFmpeg command generator

This app builds FFmpeg commands from typed recipes and user inputs.
It runs in the browser and never uploads files.

## Pinned version

The generated spec targets FFmpeg 9.1 "Gauss".
Tool data comes from pinned binaries and cached help output.

## Run the gate

Install dependencies, then run the full gate:

```sh
bun install --frozen-lockfile
bun run ci
```

The gate runs lint, format check, typecheck, design lint, tests, and build.

## Generate the spec

The spec compiler reads cached FFmpeg help files in `.cache/`.
Regenerate the JSON spec with:

```sh
node tools/spec-compiler/generate.mjs
```

Check the generated spec counts with:

```sh
bun run spec:check
```

## Recipe families

The app includes recipe families for web encoding, trim and cut, concat, audio extraction and loudness, subtitles, overlays and text, GIF and thumbnails, transforms, audio replacement, HDR to SDR, and HLS.
Advanced mode lets you add raw FFmpeg arguments.
Raw arguments are marked unverified and are not validated like recipes.

## Coverage limits

Coverage is limited to the included recipes and generated spec data.
The app does not cover everything FFmpeg can do.
Generated commands still need review before you run them.

## TUI

The TUI is Linux only.
By default, it does not execute commands.
Use `--run` to execute the generated command.
Use `--yes` with `--run` to skip confirmation.
Local tool versions are detected at runtime.
