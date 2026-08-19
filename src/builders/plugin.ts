import type { ToolSet } from "ai";
import type { AgentoPlugin } from "../plugin";
import type { Subsystem } from "../subsystem";

export interface PluginBuilderConfig {
  readonly id: string;
  readonly name: string;
  readonly version?: string;
  readonly description?: string;
}

export class PluginBuilder {
  private readonly tools: ToolSet = {};
  private readonly subsystems: Subsystem[] = [];

  constructor(private readonly config: PluginBuilderConfig) {}

  addTool(name: string, tool: ToolSet[string]): this {
    this.tools[name] = tool;
    return this;
  }

  addTools(tools: ToolSet): this {
    Object.assign(this.tools, tools);
    return this;
  }

  addSubsystem(subsystem: Subsystem): this {
    this.subsystems.push(subsystem);
    return this;
  }

  build(): AgentoPlugin {
    return {
      id: this.config.id,
      name: this.config.name,
      version: this.config.version ?? "0.1.0",
      description: this.config.description,
      registerTools: () => this.tools,
      registerSubsystems: () => this.subsystems,
    };
  }
}

export function createPluginBuilder(config: PluginBuilderConfig | string): PluginBuilder {
  if (typeof config === "string") {
    return new PluginBuilder({ id: config, name: config });
  }
  return new PluginBuilder(config);
}
