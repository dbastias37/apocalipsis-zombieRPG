export type LogEntry = { message: string; autoAdvanceMs: number };

export class Log {
  entries: LogEntry[] = [];
  push(message: string, opts: { autoAdvanceMs?: number } = {}) {
    const auto = opts.autoAdvanceMs ?? 0;
    this.entries.push({ message, autoAdvanceMs: auto });
  }
}
