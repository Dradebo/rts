import type { WorldCommand, CommandResult } from "../contract/commands";
import type { CanonicalState } from "../contract/entities";

export function validateCommand(state: CanonicalState, command: WorldCommand): CommandResult {
  if (state.closed && command.type !== "REQUEST_CLOSE") {
    return { accepted: false, code: "race_already_closed", reason: "The work object is already closed.", legalAlternatives: [] };
  }
  switch (command.type) {
    case "REQUEST_DISPATCH":
      if (state.baton) return reject("baton_already_exists", "A baton is already active.", ["REQUEST_BEGIN"]);
      return accept(["DISPATCH"]);
    case "REQUEST_BEGIN":
      if (!state.baton) return reject("no_baton", "No baton exists.", ["REQUEST_DISPATCH"]);
      if (state.baton.status === "BLOCKED") return reject("dependency_blocked", "A hard dependency is unresolved.", []);
      return accept(["BEGIN"]);
    case "REQUEST_HANDOFF":
      if (!state.baton) return reject("no_baton", "No baton exists.", ["REQUEST_DISPATCH"]);
      return accept(["HANDOFF"]);
    case "REQUEST_VERIFY":
      if (!state.baton) return reject("no_baton", "No active work exists.", ["REQUEST_DISPATCH"]);
      if (command.evidenceRefs.length === 0) return reject("evidence_missing", "Verification requires evidence.", []);
      return accept(["VERIFY"]);
    case "REQUEST_CLOSE":
      if (!state.verified) return reject("finish_evidence_missing", "Closure is illegal until verification succeeds.", ["REQUEST_VERIFY"]);
      return accept(["CLOSE"]);
  }
}

function accept(emittedEventTypes: string[]): CommandResult {
  return { accepted: true, emittedEventTypes };
}

function reject(code: string, reason: string, legalAlternatives: string[]): CommandResult {
  return { accepted: false, code, reason, legalAlternatives };
}
