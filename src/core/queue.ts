// ╔══════════════════════════════════════════════════════════════╗
// ║              GhostSaver — Queue v2.0                        ║
// ║              Cola anti-ban tipada                           ║
// ╚══════════════════════════════════════════════════════════════╝

import log from "../logger.js";
import config from "../config.js";

type Task = () => Promise<void>;

// ─── Cola FIFO con delay anti-ban ─────────────────────────────────────────────
export class MessageQueue {
  private readonly queue: Task[]  = [];
  private running: boolean        = false;
  private readonly delay: number;

  constructor(delay: number = config.queueDelay) {
    this.delay = delay;
  }

  enqueue(task: Task): void {
    this.queue.push(task);
    if (!this.running) this.process();
  }

  private async process(): Promise<void> {
    if (this.queue.length === 0) {
      this.running = false;
      return;
    }
    this.running  = true;
    const task    = this.queue.shift()!;
    try {
      await task();
    } catch (e) {
      log.error("Error en cola:", (e as Error).message);
    }
    await this.sleep(this.delay);
    this.process();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  get size(): number {
    return this.queue.length;
  }
}
