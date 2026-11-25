import type { TuiArgs } from './types.ts';

export function run(argv: string[]): void {
  const args: TuiArgs = {};

  for (const arg of argv) {
    if (arg === '--version') args.version = true;
    if (arg === '--help') args.help = true;
    if (arg === '--run') args.run = true;
    if (arg === '--yes') args.yes = true;
  }

  if (args.version) {
    console.log('ffmpeg-tui 0.0.0');
    return;
  }

  if (args.help) {
    console.log('Usage: ffmpeg-tui [--version] [--help] [--run] [--yes]');
    return;
  }

  console.log('ffmpeg-tui placeholder');
}
