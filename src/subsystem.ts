import type { ToolSet } from "ai";
import type { Effect } from "effect";

export type AgentMode = "plan" | "act";

export interface SetupContextContract {
  signal: AbortSignal;
  emitProgress(stage: string, detail?: string): void;
}

export interface SetupTaskContract {
  id: string;
  name: string;
  description: string;
  required: boolean;
  run(ctx: SetupContextContract): Promise<void> | Effect.Effect<void, unknown>;
  onProgress?(stage: string, detail?: string): void;
}

export interface Subsystem {
  readonly id: string;
  readonly name: string;
  registerTools?(): ToolSet;
  registerApprovals?(): Record<string, "user-approval">;
  registerSetupTasks?(): SetupTaskContract[];
  getInstructions?(mode: AgentMode): string | null;
  dispose?(): Promise<void> | Effect.Effect<void, never>;
}
