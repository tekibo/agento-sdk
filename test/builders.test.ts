import { describe, it, expect } from "bun:test";
import type { ToolExecutionOptions } from "ai";
import {
  defineTool,
  defineSetupTask,
  defineSubsystem,
  createPluginBuilder,
  z,
  Effect,
} from "../src/index";

const mockOptions = { toolCallId: "1", messages: [] } as unknown as ToolExecutionOptions<never>;

describe("@agento/sdk Builders", () => {
  describe("defineTool", () => {
    it("executes standard async tool functions", async () => {
      const myTool = defineTool({
        description: "Test tool",
        parameters: z.object({ value: z.string() }),
        execute: async ({ value }) => ({ upper: value.toUpperCase() }),
      });

      if (!myTool.execute) throw new Error("execute missing");
      const res = await myTool.execute({ value: "hello" }, mockOptions);
      expect(res).toEqual({ upper: "HELLO" });
    });

    it("executes Effect-based tool functions automatically", async () => {
      const effectTool = defineTool({
        description: "Effect test tool",
        parameters: z.object({ count: z.number() }),
        execute: ({ count }) =>
          Effect.gen(function* () {
            const doubled = yield* Effect.succeed(count * 2);
            return { doubled };
          }),
      });

      if (!effectTool.execute) throw new Error("execute missing");
      const res = await effectTool.execute({ count: 5 }, mockOptions);
      expect(res).toEqual({ doubled: 10 });
    });
  });

  describe("defineSetupTask", () => {
    it("wraps and executes an Effect setup task", async () => {
      const events: string[] = [];
      const task = defineSetupTask({
        id: "test:preflight",
        name: "Test Pre-Flight",
        run: (ctx) =>
          Effect.gen(function* () {
            ctx.emitProgress("Starting...");
            yield* Effect.void;
            ctx.emitProgress("Done.");
          }),
      });

      expect(task.id).toBe("test:preflight");
      expect(task.required).toBe(false);

      await task.run({
        signal: new AbortController().signal,
        emitProgress: (stage) => events.push(stage),
      });

      expect(events).toEqual(["Starting...", "Done."]);
    });
  });

  describe("defineSubsystem & PluginBuilder", () => {
    it("creates full subsystem with defaults", () => {
      const sub = defineSubsystem({
        id: "my.subsystem",
        name: "My Subsystem",
        instructions: {
          plan: "Plan instructions",
          act: "Act instructions",
        },
      });

      expect(sub.id).toBe("my.subsystem");
      expect(sub.getInstructions?.("plan")).toBe("Plan instructions");
      expect(sub.getInstructions?.("act")).toBe("Act instructions");
      expect(sub.registerTools?.()).toEqual({});
    });

    it("builds a complete plugin with createPluginBuilder", () => {
      const tool = defineTool({
        description: "Echo",
        execute: () => "echo",
      });

      const plugin = createPluginBuilder({
        id: "com.test.plugin",
        name: "Test Plugin",
      })
        .addTool("echo", tool)
        .build();

      expect(plugin.id).toBe("com.test.plugin");
      expect(plugin.registerTools?.()).toHaveProperty("echo");
    });
  });
});
