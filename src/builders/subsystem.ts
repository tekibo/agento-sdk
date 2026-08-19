import type { ToolSet } from "ai";
import { Effect } from "effect";
import type { AgentMode, SetupTaskContract, Subsystem } from "../subsystem";

export interface DefineSubsystemConfig {
  readonly id: string;
  readonly name: string;
  readonly tools?: ToolSet | (() => ToolSet);
  readonly approvals?: Record<string, "user-approval"> | (() => Record<string, "user-approval">);
  readonly setupTasks?: SetupTaskContract[] | (() => SetupTaskContract[]);
  readonly instructions?:
    | string
    | { readonly plan?: string; readonly act?: string }
    | ((mode: AgentMode) => string | null);
  readonly dispose?: () => Promise<void> | void | Effect.Effect<void, never>;
}

export function defineSubsystem(config: DefineSubsystemConfig): Subsystem {
  return {
    id: config.id,
    name: config.name,
    registerTools: () => {
      if (!config.tools) return {};
      return typeof config.tools === "function" ? config.tools() : config.tools;
    },
    registerApprovals: () => {
      if (!config.approvals) return {};
      return typeof config.approvals === "function" ? config.approvals() : config.approvals;
    },
    registerSetupTasks: () => {
      if (!config.setupTasks) return [];
      return typeof config.setupTasks === "function" ? config.setupTasks() : config.setupTasks;
    },
    getInstructions: (mode: AgentMode): string | null => {
      if (!config.instructions) return null;
      if (typeof config.instructions === "function") return config.instructions(mode);
      if (typeof config.instructions === "string") return config.instructions;
      return config.instructions[mode] ?? null;
    },
    dispose: async (): Promise<void> => {
      if (!config.dispose) return;
      const res = config.dispose();
      if (Effect.isEffect(res)) {
        await Effect.runPromise(res as Effect.Effect<void, never>);
        return;
      }
      if (res instanceof Promise) {
        await res;
      }
    },
  };
}
