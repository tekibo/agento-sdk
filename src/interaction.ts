import { Schema } from "effect";

export const AskQuestionOptionSchema = Schema.Struct({
  label: Schema.String,
  value: Schema.String,
});

export const AskQuestionPayloadSchema = Schema.Struct({
  id: Schema.String,
  text: Schema.String,
  options: Schema.optional(Schema.Array(AskQuestionOptionSchema)),
  approveCommand: Schema.optional(Schema.String),
});

export type AskQuestionPayload = typeof AskQuestionPayloadSchema.Type;

export const AskAnswerPayloadSchema = Schema.Struct({
  value: Schema.String,
  label: Schema.optional(Schema.String),
  reason: Schema.optional(Schema.String),
});

export type AskAnswerPayload = typeof AskAnswerPayloadSchema.Type;

export const ToolApprovalPayloadSchema = Schema.Struct({
  id: Schema.String,
  toolName: Schema.String,
  input: Schema.Record({ key: Schema.String, value: Schema.Unknown }),
});

export type ToolApprovalPayload = typeof ToolApprovalPayloadSchema.Type;

export const ToolApprovalResultSchema = Schema.Struct({
  approved: Schema.Boolean,
  reason: Schema.optional(Schema.String),
});

export type ToolApprovalResult = typeof ToolApprovalResultSchema.Type;

export type InteractionRequest =
  | { readonly type: "user-question"; readonly payload: AskQuestionPayload }
  | { readonly type: "tool-approval"; readonly payload: ToolApprovalPayload };

export type InteractionListener = (request: InteractionRequest) => void;
