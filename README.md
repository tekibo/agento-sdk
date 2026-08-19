<div align="center">
  <h1>@agento/sdk</h1>
  <p><strong>TypeScript framework for building deterministic AI tools, boot pre-flight checks, and human approval gates for Agento.</strong></p>

  <p>
    <a href="https://www.npmjs.com/package/@agento/sdk"><img src="https://img.shields.io/npm/v/@agento/sdk?color=black&label=npm" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@agento/sdk"><img src="https://img.shields.io/npm/dm/@agento/sdk?color=black&label=downloads" alt="npm downloads" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?color=black" alt="license" /></a>
    <a href="https://agento.tekibo.in/sdk/overview/"><img src="https://img.shields.io/badge/docs-agento.tekibo.in-blue" alt="docs" /></a>
  </p>

  <p>
    <a href="#installation">Installation</a> &nbsp;&bull;&nbsp;
    <a href="#quickstart">Quickstart</a> &nbsp;&bull;&nbsp;
    <a href="#primitives">Primitives</a> &nbsp;&bull;&nbsp;
    <a href="#effect-support">Effect Support</a> &nbsp;&bull;&nbsp;
    <a href="#documentation">Documentation</a>
  </p>
</div>

---

## Overview

`@agento/sdk` is the official, open-source TypeScript SDK for extending Agento. It allows you to author deterministic tools, attach human approval gates to sensitive operations, run boot-time pre-flight checks, and inject mode-aware guidance.

- **Zero dependencies needed**: Re-exports `tool` (AI SDK), `z` (Zod), `Effect`, and `Schema` (Effect) directly.
- **Deterministic and typed**: Strict TypeScript schemas validate all tool inputs at runtime.
- **Polyglot and standalone**: Works in any TypeScript project with zero closed-source runtime dependencies.

## Installation

```bash
# npm
npm install @agento/sdk

# pnpm
pnpm add @agento/sdk

# bun
bun add @agento/sdk
```

## Quickstart

Create a plugin with a custom deterministic tool and a boot pre-flight check:

```typescript
import {
  definePlugin,
  defineTool,
  defineSubsystem,
  defineSetupTask,
  z,
} from "@agento/sdk";

// 1. Define a deterministic tool
export const weatherTool = defineTool({
  description: "Get current weather conditions for a city",
  parameters: z.object({
    city: z.string().describe("City name"),
  }),
  execute: async ({ city }) => {
    return { city, temperature: 22, condition: "Sunny" };
  },
});

// 2. Define a subsystem with pre-flight checks and approval gates
export const weatherSubsystem = defineSubsystem({
  id: "com.example.weather.subsystem",
  name: "Weather Subsystem",
  setupTasks: [
    defineSetupTask({
      id: "weather:preflight",
      name: "Weather API Connection Check",
      run: (ctx) => {
        ctx.emitProgress("Connecting to weather service...");
        ctx.emitProgress("Service online.");
      },
    }),
  ],
  approvals: {
    // Requires human confirmation dialog before execution
    publish_forecast: "user-approval",
  },
});

// 3. Export plugin definition as default
export default definePlugin({
  id: "com.example.weather",
  name: "Weather Plugin",
  version: "0.1.0",
  description: "Weather lookup tools and forecasts",
  registerTools: () => ({ weather: weatherTool }),
  registerSubsystems: () => [weatherSubsystem],
});
```

## Primitives

| Primitive | Purpose |
| :--- | :--- |
| `defineTool()` | Define schema-validated AI tools using standard promises or Effect programs. |
| `defineSubsystem()` | Package related tools, approval policies, mode instructions, and lifecycle hooks. |
| `defineSetupTask()` | Register boot-time pre-flight checks with real-time progress emission. |
| `definePlugin()` | Aggregate tools and subsystems into a single distributable npm package. |

## Effect support

`@agento/sdk` natively supports Effect programs across tools and boot setup tasks:

```typescript
import { defineTool, z, Effect } from "@agento/sdk";

export const computeTool = defineTool({
  description: "Execute a resilient computation with Effect",
  parameters: z.object({
    count: z.number(),
  }),
  execute: ({ count }) =>
    Effect.gen(function* () {
      const doubled = yield* Effect.succeed(count * 2);
      return { doubled, timestamp: new Date().toISOString() };
    }),
});
```

## Scaffolding starter plugins

To scaffold a plugin repository from official starter templates, use the Agento CLI:

```bash
# Standard starter
agento plugin init my-plugin

# Minimal single-file
agento plugin init quick-tools --flavor minimal

# Effect native
agento plugin init worker --flavor effect

# MCP server bridge
agento plugin init postgres-mcp --flavor mcp-bridge
```

## Documentation

- [Step-by-Step Plugin Creation Guide](https://agento.tekibo.in/sdk/creating-plugins/)
- [SDK Overview & Architecture](https://agento.tekibo.in/sdk/overview/)
- [Custom Tools & Approval Gates](https://agento.tekibo.in/sdk/custom-tools/)
- [Subsystems & Boot Setup Tasks](https://agento.tekibo.in/sdk/subsystems/)
- [Installing & Managing Plugins](https://agento.tekibo.in/sdk/installing-plugins/)
- [CLI Plugin Command Reference](https://agento.tekibo.in/getting-started/commands/#agento-plugin-init-name-targetdir---flavor-standardminimal--effectmcp-bridge)

## License

[MIT](./LICENSE)
