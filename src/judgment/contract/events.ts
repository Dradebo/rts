export type SemanticType =
  | "OBSERVE" | "PROPOSE" | "ADJUDICATE"
  | "DISPATCH" | "ACCEPT" | "BEGIN" | "BLOCK"
  | "RESPOND" | "HANDOFF" | "VERIFY" | "CLOSE" | "REOPEN";

export type JudgmentEvent = {
  event_id: string;
  occurred_at: string;
  semantic_type: SemanticType;
  actor_id: string;
  work_object_id: string;
  baton_id?: string | null;
  evidence_refs?: string[];
  metadata?: Record<string, unknown>;
};
