import { describe, expect, it } from "vitest";
import { reduceEvents } from "@/judgment/engine/reduce-events";
import { validateCommand } from "@/judgment/engine/validate-command";
import { projectBatonField } from "@/judgment/projection/baton-field-projector";
import { liveRace001Events } from "@/judgment/fixtures/live-race-001-events";
import type { JudgmentEvent } from "@/judgment/contract/events";

const workObjectId = "race_baton_field_v0";

function evt(
  semantic_type: JudgmentEvent["semantic_type"],
  actor_id: string,
  extra: Partial<JudgmentEvent> = {},
): JudgmentEvent {
  return {
    event_id: `test_${semantic_type}_${Math.random()}`,
    occurred_at: "2026-08-27T03:00:00Z",
    semantic_type,
    actor_id,
    work_object_id: workObjectId,
    baton_id: "baton_bf_001",
    ...extra,
  };
}

describe("Judgment OS Baton Field", () => {
  it("projects the live race as blocked with builder holding the baton", () => {
    const state = reduceEvents(workObjectId, liveRace001Events);
    const field = projectBatonField(state);

    expect(state.status).toBe("BLOCKED");
    expect(state.baton?.ownerActorId).toBe("actor_builder");
    expect(field.workObject.finishActive).toBe(false);
    expect(field.routes.find(route => route.id === "route:finish")?.kind).toBe("BLOCKED");
  });

  it("refuses closure before evidence-backed verification", () => {
    const state = reduceEvents(workObjectId, liveRace001Events);
    const result = validateCommand(state, {
      type: "REQUEST_CLOSE",
      workObjectId,
    });

    expect(result.accepted).toBe(false);
    if (!result.accepted) {
      expect(result.code).toBe("finish_evidence_missing");
      expect(result.legalAlternatives).toContain("REQUEST_VERIFY");
    }
  });

  it("opens the finish only after dependency response and verification", () => {
    const events: JudgmentEvent[] = [
      ...liveRace001Events,
      evt("RESPOND", "actor_builder", {
        metadata: { dependencyId: "dep_projection_adapter" },
      }),
      evt("VERIFY", "actor_validator", {
        evidence_refs: ["test:illegal-close", "test:projection-replay"],
      }),
    ];

    const state = reduceEvents(workObjectId, events);
    const field = projectBatonField(state);

    expect(state.dependencies.dep_projection_adapter).toBe(true);
    expect(state.verified).toBe(true);
    expect(field.workObject.finishActive).toBe(true);
    expect(field.routes.find(route => route.id === "route:finish")?.kind).toBe("LEGAL");
  });

  it("replay deterministically reconstructs final closure", () => {
    const events: JudgmentEvent[] = [
      ...liveRace001Events,
      evt("RESPOND", "actor_builder", {
        metadata: { dependencyId: "dep_projection_adapter" },
      }),
      evt("VERIFY", "actor_validator", {
        evidence_refs: ["test:illegal-close", "test:projection-replay"],
      }),
      evt("CLOSE", "actor_operator"),
    ];

    const a = reduceEvents(workObjectId, events);
    const b = reduceEvents(workObjectId, JSON.parse(JSON.stringify(events)) as JudgmentEvent[]);

    expect(a).toEqual(b);
    expect(a.closed).toBe(true);
    expect(a.status).toBe("CLOSED");
  });
});
