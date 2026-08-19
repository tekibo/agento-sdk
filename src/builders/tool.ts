import type { ToolSet } from "ai";
import { Effect } from "effect";
import { z } from "zod";

export interface DefineToolConfig<
  SCHEMA extends z.ZodTypeAny = z.ZodObject<Record<string, never>>,
  RESULT = unknown,
> {
  readonly description: string;
  readonly parameters?: SCHEMA;
  readonly inputSchema?: SCHEMA;
  readonly execute: (
    input: z.infer<SCHEMA>,
  ) => Promise<RESULT> | RESULT | Effect.Effect<RESULT, unknown>;
}

export function defineTool<
  SCHEMA extends z.ZodTypeAny = z.ZodObject<Record<string, never>>,
  RESULT = unknown,
>(config: DefineToolConfig<SCHEMA, RESULT>): ToolSet[string] {
  const inputSchema = config.parameters ?? config.inputSchema ?? z.object({});
  return {
    description: config.description,
    inputSchema,
    execute: async (input: z.infer<SCHEMA>) => {
      const outcome = config.execute(input);
      if (Effect.isEffect(outcome)) {
        return Effect.runPromise(outcome as Effect.Effect<RESULT, unknown>);
      }
      return outcome;
    },
  } as ToolSet[string];
}
