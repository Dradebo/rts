import type { CanonicalState } from "../contract/entities";

export type BatonFieldProjection = {
  workObject: { id: string; state: CanonicalState["status"]; finishActive: boolean };
  baton?: { id: string; ownerActorId: string; state: string };
  routes: Array<{ id: string; kind: "LEGAL" | "BLOCKED"; reason?: string }>;
  proofGate: { active: boolean; evidenceCount: number };
};

export function projectBatonField(state: CanonicalState): BatonFieldProjection {
  const blocked = state.status === "BLOCKED";
  return {
    workObject: { id: state.workObjectId, state: state.status, finishActive: state.verified && !state.closed },
    baton: state.baton ? { id: state.baton.id, ownerActorId: state.baton.ownerActorId, state: state.baton.status } : undefined,
    routes: [
      { id: "route:finish", kind: state.verified ? "LEGAL" : "BLOCKED", reason: state.verified ? undefined : "finish_evidence_missing" },
      ...(blocked ? [{ id: "route:dependency", kind: "BLOCKED" as const, reason: "dependency_unresolved" }] : [])
    ],
    proofGate: { active: state.verified, evidenceCount: state.evidenceRefs.length }
  };
}
