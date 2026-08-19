import { Effect } from "effect";
import type { SetupContextContract, SetupTaskContract } from "../subsystem";

export interface DefineSetupTaskConfig {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly run: (
    ctx: SetupContextContract,
  ) => Promise<void> | void | Effect.Effect<void, unknown>;
  readonly onProgress?: (stage: string, detail?: string) => void;
}

export function defineSetupTask(config: DefineSetupTaskConfig): SetupTaskContract {
  return {
    id: config.id,
    name: config.name,
    description: config.description ?? config.name,
    required: config.required ?? false,
    run: async (ctx: SetupContextContract): Promise<void> => {
      const outcome = config.run(ctx);
      if (Effect.isEffect(outcome)) {
        await Effect.runPromise(outcome as Effect.Effect<void, unknown>);
        return;
      }
      if (outcome instanceof Promise) {
        await outcome;
      }
    },
    onProgress: config.onProgress,
  };
}
