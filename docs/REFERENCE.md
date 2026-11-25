# Reference

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

## High-value groups

The high-value set has 16 outcomes in four groups.
Each group has four outcomes.

| Group    | Outcomes                                                           |
| -------- | ------------------------------------------------------------------ |
| Delivery | `faststart`, `explicit-map`, `hls`, `dash`                         |
| Metadata | `strip-metadata`, `set-metadata`, `disposition`, `embed-subtitles` |
| Timing   | `force-keyframes`, `copyts`, `avoid-negative-ts`, `trim-copy`      |
| Graphs   | `side-by-side`, `filter-script`, `loop-image`, `lavfi-null-test`   |

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

## Raw snippets

Raw arguments bypass recipe checks.
The TUI marks raw arguments unverified.
The command stays unverified until someone checks it.
