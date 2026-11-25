export type ShellType = 'posix';

export interface TuiArgs {
  version?: boolean;
  help?: boolean;
  run?: boolean;
  yes?: boolean;
}

export interface PlanView {
  title: string;
  steps: string[];
}

export interface RunResult {
  ok: boolean;
  output: string;
}
