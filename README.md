# ffmpeg-wrapper

The TUI builds `ffmpeg` commands from plain-language tasks.
It helps users who do not want to memorize filters and flags.
It runs in a terminal on Linux and never uploads media files.

## Install

Download the Linux x64 or arm64 binary from the releases.
Or install dependencies from source:

```sh
bun install --frozen-lockfile
```

## Quick start

Run one of these commands:

```sh
bun run tui
bun run tui --run
bun run tui --run --yes
```

The first command starts the TUI without execution.
The second command allows execution with confirmation.
The third command executes without confirmation.

## How it works

Pick a task, enter input and output paths, review the command, then run it if you want.
The TUI shows six curated tasks: Convert for web, Trim a clip, Extract audio, Make a GIF, Compress, and Normalize loudness.
Use More tasks to search all available recipes.
Use Advanced for in and out points, mode, and raw arguments.
The default mode never executes a command.

## Keys

| Key       | Screen  | Action                                         |
| --------- | ------- | ---------------------------------------------- |
| `Up/Down` | Any     | Move between tasks or fields.                  |
| `Type`    | Options | Edit the focused field.                        |
| `Enter`   | Options | Open the result screen or confirm hardware.    |
| `m`       | Tasks   | Open the More tasks search.                    |
| `a`       | Options | Toggle Advanced fields.                        |
| `?`       | Any     | Open or close help.                            |
| `Esc`     | Any     | Return to the previous screen.                 |
| `r`       | Result  | Start the run in `--run` mode without `--yes`. |
| `q`       | Result  | Quit.                                          |
| `Ctrl+C`  | Any     | Abort a running command and exit.              |

## Flags

| Flag        | Effect                                           |
| ----------- | ------------------------------------------------ |
| `--version` | Print the TUI version and exit.                  |
| `--help`    | Print usage and exit.                            |
| `--run`     | Allow command execution. Off by default.         |
| `--yes`     | Skip the confirmation prompt before execution.   |
| `--force`   | Allow overwrite of an existing output file.      |
| `--unsafe`  | Allow guarded network and filter-script recipes. |

## Safety

The TUI does not execute commands by default.
It blocks overwrite of an existing output file unless you pass `--force`.
Network and filter-script recipes need `--unsafe`.
Hardware recipes need confirmation on the result screen before they run.
It binds placeholders before execution and blocks unbound placeholders.
After a successful run it verifies the output with `ffprobe` and a non-empty file check.

## Limits

The TUI runs on Linux only.
The spec targets one pinned FFmpeg version.
Hardware encoders may be absent from a local install.
Raw arguments have no guarantee of correctness.
Flag combinations have no guarantee of working together.
The app does not guarantee a successful conversion.

## Development

Repository layout:

- `bin/`: TUI entry point.
- `src/content/`: curated task labels and descriptions.
- `src/recipes/`, `src/data/`: recipes and generated data.
- `src/spec/`, `src/tools/`: generated spec and runtime detection.
- `src/runner/`, `src/progress/`: execution and progress parsing.
- `src/tui/`: terminal screens and components.
- `tests/`: unit and TUI tests.
- `scripts/`: checks and packaging scripts.
- `docs/`: reference documentation.

To add a task, add or update a recipe in `src/data/` and keep it in the recipe loader.
For a curated task, also update `src/tui/tasks.ts`.

Test and build commands:

```sh
bun run ci
bun run tui:test
bun run tui:build
bash scripts/package-tui.sh
```

See [docs/REFERENCE.md](docs/REFERENCE.md) for coverage, recipes, and examples.
