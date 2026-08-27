import type { JudgmentEvent } from "../contract/events";

export const liveRace001Events: JudgmentEvent[] = [
  { event_id: "evt_001", occurred_at: "2026-08-27T02:32:00Z", semantic_type: "OBSERVE", actor_id: "actor_architect", work_object_id: "race_baton_field_v0", evidence_refs: ["donor_audit_v1"] },
  { event_id: "evt_002", occurred_at: "2026-08-27T02:33:00Z", semantic_type: "ADJUDICATE", actor_id: "actor_operator", work_object_id: "race_baton_field_v0", evidence_refs: ["donor_audit_v1"] },
  { event_id: "evt_003", occurred_at: "2026-08-27T02:34:00Z", semantic_type: "DISPATCH", actor_id: "actor_builder", work_object_id: "race_baton_field_v0", baton_id: "baton_bf_001" },
  { event_id: "evt_004", occurred_at: "2026-08-27T02:35:00Z", semantic_type: "ACCEPT", actor_id: "actor_builder", work_object_id: "race_baton_field_v0", baton_id: "baton_bf_001" },
  { event_id: "evt_005", occurred_at: "2026-08-27T02:36:00Z", semantic_type: "BEGIN", actor_id: "actor_builder", work_object_id: "race_baton_field_v0", baton_id: "baton_bf_001" },
  { event_id: "evt_006", occurred_at: "2026-08-27T02:37:00Z", semantic_type: "BLOCK", actor_id: "actor_builder", work_object_id: "race_baton_field_v0", baton_id: "baton_bf_001", metadata: { dependencyId: "dep_projection_adapter" } }
];
