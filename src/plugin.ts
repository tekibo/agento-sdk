import { Schema } from "effect";
import type { ToolSet } from "ai";
import type { Subsystem } from "./subsystem";

export const AgentoPluginDescriptorSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  version: Schema.String,
  description: Schema.optional(Schema.String),
});

export interface AgentoPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  registerSubsystems?(): Subsystem[];
  registerTools?(): ToolSet;
}

export function definePlugin(plugin: AgentoPlugin): AgentoPlugin {
  return plugin;
}
