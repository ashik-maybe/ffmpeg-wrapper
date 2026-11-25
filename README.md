# ffmpeg-wrapper

This app builds FFmpeg commands from typed recipes and user input.
The TUI runs in a terminal on Linux.
The app does not upload media files.

The spec targets FFmpeg 9.1 "Gauss".
Tool data comes from pinned binaries and cached help output.

## TUI

The TUI runs on Linux only.
Prebuilt binaries target Linux x64 and Linux arm64.

Install dependencies, then start the TUI from source:

```sh
bun install --frozen-lockfile
bun run tui
```

Build a standalone x64 binary with `bun run tui:build`.
Build an arm64 binary with `bun run tui:arm`.
Package release binaries with `bash scripts/package-tui.sh`.

### TUI flags

| Flag        | Effect                                               |
| ----------- | ---------------------------------------------------- |
| `--version` | Print the TUI version and exit.                      |
| `--help`    | Print usage and exit.                                |
| `--run`     | Enable command execution on the result screen.       |
| `--yes`     | Run without manual confirmation when `--run` is set. |
| `--unsafe`  | Allow guarded network and filter-script recipes.     |
| `--force`   | Allow overwrite of an existing output file.          |

### TUI fields

The options screen shows these fields:

- Input path
- Output path
- In point
- Out point
- Mode
- Raw arguments

### Placeholder binding and blocked execution

The TUI binds recipe placeholders from field values.
An unbound placeholder creates an error finding.
The TUI blocks execution when findings contain an error.
The TUI also blocks execution when findings contain an unbound placeholder.

### Overwrite blocking and --force

Before execution, the TUI checks the output path.
If the output file exists and `--force` is not set, the TUI blocks execution.
Set `--force` to allow overwrite of that output file.

### Unsafe guard and --unsafe

A network recipe requires `--unsafe`.
The network recipe ids are `hls`, `dash`, `rtmp`, and `srt`.
A filter-script recipe requires `--unsafe`.
The filter-script recipe id is `filter-script`.
Without `--unsafe`, the TUI blocks these recipes.

### Hardware confirmation

Hardware recipes need hardware confirmation before execution.
The hardware recipe ids are `nvenc`, `qsv`, `vaapi`, `videotoolbox`, and `hevc-vulkan`.
The result screen marks these recipes as unverified hardware recipes.
Press Enter to confirm the hardware recipe, then press Enter to run.

### Network and script guards

The TUI applies guards before execution.
Network and script guards block guarded recipes unless `--unsafe` is set.
The result screen shows the blocked reason.

### ffprobe verification

After a successful run, the TUI verifies the output.
It runs `ffprobe` on the output path.
It also checks that the output file exists and is not empty.
The result screen shows `verified` or `failed`.

### Key bindings

| Key          | Action                                               |
| ------------ | ---------------------------------------------------- |
| Enter        | Confirm selection, open result, or run when allowed. |
| Esc          | Return to the previous screen.                       |
| Tab / Arrows | Move between option fields.                          |
| Ctrl+C       | Abort a running command and exit.                    |

By default, the TUI does not execute commands.
Add `--run` to enable execution.
Add `--yes` with `--run` to run after checks pass.

### Runtime spec detection

The TUI detects local `ffmpeg` and `ffprobe` binaries at runtime.
It reads the FFmpeg version from `ffmpeg -version`.
It compiles a runtime spec from the local binary.
The result screen shows the detected version.

## Coverage

The generated spec provides these counts:

| Item            | Count |
| --------------- | ----: |
| Options         |   201 |
| Filters         |   482 |
| Encoders        |   198 |
| Muxers          |   191 |
| Hwaccels        |     0 |
| Filter details  |   482 |
| Encoder details |   198 |
| Decoders        |   530 |
| Demuxers        |   370 |
| Protocols       |    70 |
| Pixel formats   |   270 |
| Sample formats  |    13 |
| Option details  |   201 |

The generated hwaccels list is empty.

The recipe files hold 64 recipe entries across seven JSON files.
Two entries repeat an id from an earlier file.
The loader keeps the first entry for each id.
The app therefore exposes 62 unique recipes.

The high-value set has 16 outcomes in four groups.
The groups are Delivery, Metadata, Timing, and Graphs.
Each group has four outcomes.

## Recipes

The app groups recipes by purpose.

Web encoding:

`web-h264`, `web-hevc`, `web-av1`, `web-vp9`, `nvenc`, `av1-svt`,
`vp9-alt`, `hevc-vulkan`, `prores-mov`, `qsv`, `vaapi`, `videotoolbox`

Delivery and streaming:

`hls`, `dash`, `rtmp`, `srt`, `faststart`, `explicit-map`

Metadata and timing:

`strip-metadata`, `set-metadata`, `disposition`, `force-keyframes`,
`copyts`, `avoid-negative-ts`

Trim, concat, and input:

`trim-copy`, `trim-re-encode`, `concat-same-codec`, `concat-re-encode`,
`concat-demuxer`, `screen-capture`, `image-sequence`, `loop-image`

Audio:

`extract-audio`, `loudnorm`, `loudnorm-target`, `loudnorm-two-pass`,
`audio-mix`, `replace-audio`

Subtitles:

`burn-subtitles`, `embed-subtitles`

Images and thumbnails:

`gif`, `thumbnails`, `thumbnail-sheet`, `palette-gif`

Filters and transforms:

`scale`, `crop`, `rotate`, `crop-detect`, `deinterlace`, `denoise`,
`upscale`, `downscale`, `fade`, `chromakey`, `hdr-to-sdr`, `hdr-sdr`,
`watermark`, `drawtext`

Filter graphs and tests:

`side-by-side`, `filter-script`, `lavfi-null-test`

Quality tuning:

`crf-tuning`

## High-value examples

Prepare a file for web playback.
The `faststart` recipe adds the flag below.
It moves metadata to the start of an MP4 file.

```sh
-movflags +faststart
```

Write metadata.
The `set-metadata` recipe sets a title and a language.

```sh
-metadata title=TITLE -metadata:s:a:0 language=LANGUAGE
```

Remove metadata.
The `strip-metadata` recipe adds the flag below.

```sh
-map_metadata -1
```

Force keyframes.
The `force-keyframes` recipe uses an expression.

```sh
-force_key_frames expr:gte(t,n_forced*5)
```

Map streams explicitly.
The `explicit-map` recipe selects video and audio.

```sh
-map 0:v -map 0:a -c copy
```

Build filter graphs.
The `side-by-side` recipe stacks two inputs.

```sh
-filter_complex hstack -map 0:a?
```

Load a graph from a file with the `filter-script` recipe.

```sh
-filter_complex_script SCRIPT
```

Make a GIF.
The `palette-gif` recipe builds a two-branch graph.

```sh
-filter_complex "[0:v] split [a][b];[a] palettegen [p];[b][p] paletteuse"
```

Control GIF frame rate with the `gif` recipe.

```sh
-vf fps=FPS
```

Normalize loudness.
The `loudnorm` recipe adds a simple filter.

```sh
-af loudnorm
```

Set loudness targets with the `loudnorm-target` recipe.

```sh
-af loudnorm=I=-16:LRA=11:TP=-1.5
```

Run two-pass loudness with the `loudnorm-two-pass` recipe.
It passes measured values into the filter.

```sh
-af loudnorm=I=I:TP=TP:LRA=LRA:measured_I=MI:measured_TP=MTP:measured_LRA=MLRA:measured_thresh=MT:linear=true:print_format=summary
```

Test a generated source with the `lavfi-null-test` recipe.

```sh
-f lavfi -i testsrc -f null -
```

Build a contact sheet with the `thumbnail-sheet` recipe.

```sh
-vf fps=FPS,tile=TILE
```

## Raw arguments

Raw arguments bypass recipe checks.
The TUI marks raw arguments unverified.
The command stays unverified until someone checks it.

## Confidence labels

The command receipt shows `Confidence: High confidence` for recipe commands.
Recipe data uses `verified` and `unverified` values.
Raw arguments show an `Unverified` warning.
Runtime checks can report `E_UNVERIFIED` when an encoder is unavailable.

## Verification

Install dependencies first, then run the full gate:

```sh
bun run ci
```

The gate runs lint, format check, typecheck, design lint, spec check,
readme check, tests, and TUI tests.

Run the TUI tests alone:

```sh
bun run tui:test
```

Check the generated spec counts alone with `bun run spec:check`.

## Known limits

The TUI does not execute commands unless `--run` is set.
The app does not use an external network at runtime.
The app does not guarantee that tool combinations work together.
It does not execute recipe combinations during checks.
Coverage stops at the generated spec data and the included recipes.
Hardware encoders may be absent from a local install.
FFmpeg 9.1 flags may differ from a local older or newer binary.
Review every generated command before you run it.
