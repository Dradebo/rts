export type WorldCommand =
  | { type: "REQUEST_DISPATCH"; workObjectId: string; actorId: string }
  | { type: "REQUEST_BEGIN"; batonId: string }
  | { type: "REQUEST_HANDOFF"; batonId: string; targetActorId: string }
  | { type: "REQUEST_VERIFY"; workObjectId: string; evidenceRefs: string[] }
  | { type: "REQUEST_CLOSE"; workObjectId: string };

export type CommandResult =
  | { accepted: true; emittedEventTypes: string[] }
  | { accepted: false; code: string; reason: string; legalAlternatives: string[] };
