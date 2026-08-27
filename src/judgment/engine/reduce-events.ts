import type { JudgmentEvent } from "../contract/events";
import type { CanonicalState } from "../contract/entities";

export function initialState(workObjectId: string): CanonicalState {
  return {
    workObjectId,
    status: "READY",
    dependencies: {},
    evidenceRefs: [],
    verified: false,
    closed: false
  };
}

export function reduceEvent(state: CanonicalState, event: JudgmentEvent): CanonicalState {
  const next: CanonicalState = structuredClone(state);
  switch (event.semantic_type) {
    case "DISPATCH":
      next.baton = { id: event.baton_id ?? `baton:${event.work_object_id}`, ownerActorId: event.actor_id, status: "OFFERED" };
      break;
    case "ACCEPT":
      if (next.baton) next.baton.status = "ACCEPTED";
      break;
    case "BEGIN":
      next.status = "RUNNING";
      if (next.baton) next.baton.status = "RUNNING";
      break;
    case "BLOCK":
      next.status = "BLOCKED";
      if (next.baton) next.baton.status = "BLOCKED";
      break;
    case "RESPOND": {
      const dependencyId = String(event.metadata?.dependencyId ?? "");
      if (dependencyId) next.dependencies[dependencyId] = true;
      if (next.status === "BLOCKED") next.status = "RUNNING";
      if (next.baton?.status === "BLOCKED") next.baton.status = "RUNNING";
      break;
    }
    case "HANDOFF":
      if (next.baton) {
        next.baton.ownerActorId = String(event.metadata?.targetActorId ?? event.actor_id);
        next.baton.status = "ACCEPTED";
      }
      break;
    case "VERIFY":
      next.evidenceRefs.push(...(event.evidence_refs ?? []));
      next.verified = true;
      next.status = "WAITING_VALIDATION";
      if (next.baton) next.baton.status = "WAITING_VALIDATION";
      break;
    case "CLOSE":
      next.closed = true;
      next.status = "CLOSED";
      if (next.baton) next.baton.status = "CLOSED";
      break;
    case "REOPEN":
      next.closed = false;
      next.verified = false;
      next.status = "READY";
      break;
  }
  return next;
}

export function reduceEvents(workObjectId: string, events: JudgmentEvent[]): CanonicalState {
  return events.reduce(reduceEvent, initialState(workObjectId));
}
