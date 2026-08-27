export type BatonStatus =
  | "OFFERED" | "ACCEPTED" | "RUNNING" | "BLOCKED"
  | "WAITING_EXTERNAL" | "WAITING_VALIDATION" | "CLOSED";

export type CanonicalState = {
  workObjectId: string;
  status: "READY" | "RUNNING" | "BLOCKED" | "WAITING_VALIDATION" | "CLOSED";
  baton?: {
    id: string;
    ownerActorId: string;
    status: BatonStatus;
  };
  dependencies: Record<string, boolean>;
  evidenceRefs: string[];
  verified: boolean;
  closed: boolean;
};
