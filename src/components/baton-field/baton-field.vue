<script setup lang="ts">
import { computed, ref } from "vue";
import { reduceEvents } from "@/judgment/engine/reduce-events";
import { validateCommand } from "@/judgment/engine/validate-command";
import { projectBatonField } from "@/judgment/projection/baton-field-projector";
import { liveRace001Events } from "@/judgment/fixtures/live-race-001-events";
import type { JudgmentEvent } from "@/judgment/contract/events";
import type { WorldCommand } from "@/judgment/contract/commands";

const workObjectId = "race_baton_field_v0";
const events = ref<JudgmentEvent[]>(structuredClone(liveRace001Events));
const selected = ref<"builder" | "dependency" | "gate" | "finish">("builder");
const message = ref("Builder has the baton. Projection adapter dependency is blocking the route.");
const replayIndex = ref(events.value.length);

const state = computed(() => reduceEvents(workObjectId, events.value.slice(0, replayIndex.value)));
const projection = computed(() => projectBatonField(state.value));
const isLive = computed(() => replayIndex.value === events.value.length);
const dependencyResolved = computed(() => !!state.value.dependencies.dep_projection_adapter);

function append(event: JudgmentEvent): void {
  if (!isLive.value) replayIndex.value = events.value.length;
  events.value.push(event);
  replayIndex.value = events.value.length;
}

function event(type: JudgmentEvent["semantic_type"], actor: string, extra: Partial<JudgmentEvent> = {}): JudgmentEvent {
  return {
    event_id: `evt_${String(events.value.length + 1).padStart(3, "0")}`,
    occurred_at: new Date().toISOString(),
    semantic_type: type,
    actor_id: actor,
    work_object_id: workObjectId,
    baton_id: state.value.baton?.id ?? "baton_bf_001",
    ...extra,
  };
}

function runCommand(command: WorldCommand): boolean {
  const result = validateCommand(state.value, command);
  if (!result.accepted) {
    message.value = `MOVE REFUSED — ${result.reason}`;
    return false;
  }
  return true;
}

function tryClose(): void {
  selected.value = "finish";
  if (!runCommand({ type: "REQUEST_CLOSE", workObjectId })) return;
  append(event("CLOSE", "actor_operator"));
  message.value = "Race closed. Finish condition is now canonical.";
}

function resolveDependency(): void {
  selected.value = "dependency";
  if (dependencyResolved.value) {
    message.value = "Projection adapter dependency is already satisfied.";
    return;
  }
  append(event("RESPOND", "actor_builder", { metadata: { dependencyId: "dep_projection_adapter" } }));
  message.value = "Dependency satisfied. The blocked route has reopened.";
}

function verify(): void {
  selected.value = "gate";
  const command: WorldCommand = {
    type: "REQUEST_VERIFY",
    workObjectId,
    evidenceRefs: ["test:illegal-close", "test:projection-replay"],
  };
  if (!runCommand(command)) return;
  append(event("VERIFY", "actor_validator", { evidence_refs: command.evidenceRefs }));
  message.value = "Verification accepted. Finish route is now legal.";
}

function previousEvent(): void {
  replayIndex.value = Math.max(0, replayIndex.value - 1);
  message.value = `Replay ${replayIndex.value}/${events.value.length}`;
}

function nextEvent(): void {
  replayIndex.value = Math.min(events.value.length, replayIndex.value + 1);
  message.value = replayIndex.value === events.value.length ? "LIVE STATE" : `Replay ${replayIndex.value}/${events.value.length}`;
}

function jumpLive(): void {
  replayIndex.value = events.value.length;
  message.value = "LIVE STATE";
}
</script>

<template>
  <main class="baton-shell">
    <header class="hud">
      <div>
        <p class="eyebrow">JUDGMENT OS / LIVE RACE</p>
        <h1>The Baton Field</h1>
      </div>
      <div class="state-chip" :data-state="state.status">{{ state.status }}</div>
    </header>

    <section class="field" aria-label="Baton Field operational world">
      <svg class="routes" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <path class="route route-a" d="M190 350 C330 300 390 260 500 250" />
        <path
          class="route route-b"
          :class="{ blocked: !dependencyResolved }"
          d="M500 250 C625 230 680 235 790 305"
        />
        <path
          class="route route-c"
          :class="{ blocked: !state.verified }"
          d="M790 305 C860 330 885 330 930 285"
        />
      </svg>

      <button class="node operator" @click="selected = 'builder'; message = 'Operator owns adjudication and closure authority.'">
        <span class="icon">O</span>
        <span>Operator</span>
      </button>

      <button class="node builder" :class="{ selected: selected === 'builder' }" @click="selected = 'builder'; message = 'Builder currently carries the baton.'">
        <span class="icon">B</span>
        <span>Builder</span>
        <b v-if="state.baton?.ownerActorId === 'actor_builder'" class="baton">BATON</b>
      </button>

      <button class="node dependency" :class="{ open: dependencyResolved, selected: selected === 'dependency' }" @click="selected = 'dependency'">
        <span class="icon">{{ dependencyResolved ? '✓' : '×' }}</span>
        <span>Projection Adapter</span>
        <small>{{ dependencyResolved ? 'OPEN' : 'BLOCKED' }}</small>
      </button>

      <button class="node gate" :class="{ open: state.verified, selected: selected === 'gate' }" @click="selected = 'gate'">
        <span class="icon">V</span>
        <span>Verification Gate</span>
        <small>{{ state.verified ? 'PASSED' : 'LOCKED' }}</small>
      </button>

      <button class="node finish" :class="{ open: projection.workObject.finishActive || state.closed, selected: selected === 'finish' }" @click="tryClose">
        <span class="icon">F</span>
        <span>{{ state.closed ? 'Closed' : 'Finish' }}</span>
        <small>{{ state.closed ? 'CANONICAL' : projection.workObject.finishActive ? 'LEGAL' : 'REFUSED' }}</small>
      </button>
    </section>

    <section class="control-deck">
      <div class="status-copy">
        <p class="eyebrow">FIELD REPORT</p>
        <p>{{ message }}</p>
      </div>

      <div class="actions" v-if="isLive">
        <button @click="tryClose" :disabled="state.closed">Try close</button>
        <button @click="resolveDependency" :disabled="dependencyResolved || state.closed">Resolve dependency</button>
        <button @click="verify" :disabled="!dependencyResolved || state.verified || state.closed">Verify</button>
      </div>

      <div class="replay">
        <button @click="previousEvent" :disabled="replayIndex === 0">◀</button>
        <span>EVENT {{ replayIndex }} / {{ events.length }}</span>
        <button @click="nextEvent" :disabled="replayIndex === events.length">▶</button>
        <button v-if="!isLive" @click="jumpLive">LIVE</button>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.baton-shell {
  min-height: 100vh;
  background: #0b1015;
  color: #e9edf1;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  padding: 22px;
  box-sizing: border-box;
}
.hud, .control-deck { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
h1 { margin: 2px 0 0; font-size: clamp(28px, 4vw, 52px); letter-spacing: -0.05em; }
.eyebrow { margin: 0; opacity: .55; font-size: 11px; letter-spacing: .15em; }
.state-chip { border: 1px solid #63707d; padding: 8px 12px; border-radius: 999px; font-size: 12px; }
.field {
  position: relative;
  height: min(68vh, 650px);
  min-height: 430px;
  margin: 20px 0;
  overflow: hidden;
  border: 1px solid #26323d;
  border-radius: 18px;
  background:
    linear-gradient(30deg, #111923 12%, transparent 12.5%, transparent 87%, #111923 87.5%, #111923),
    linear-gradient(150deg, #111923 12%, transparent 12.5%, transparent 87%, #111923 87.5%, #111923),
    linear-gradient(30deg, #111923 12%, transparent 12.5%, transparent 87%, #111923 87.5%, #111923),
    #0f161e;
  background-size: 80px 140px;
}
.routes { position: absolute; inset: 0; width: 100%; height: 100%; }
.route { fill: none; stroke: #657686; stroke-width: 6; stroke-linecap: round; stroke-dasharray: 10 12; vector-effect: non-scaling-stroke; }
.route.blocked { stroke: #642f35; stroke-dasharray: 3 12; }
.node {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 120px;
  padding: 12px;
  border: 1px solid #465666;
  border-radius: 8px;
  background: #15202a;
  color: inherit;
  box-shadow: 0 12px 30px rgba(0,0,0,.35);
  cursor: pointer;
  display: grid;
  gap: 3px;
  justify-items: center;
}
.node:hover, .node.selected { border-color: #a9bac9; transform: translate(-50%, -52%); }
.node.open { border-color: #7e9f87; }
.node small { opacity: .55; font-size: 9px; }
.icon { width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 5px; font-weight: 800; }
.baton { position: absolute; right: -23px; top: -14px; font-size: 9px; padding: 5px 7px; border-radius: 999px; background: #d8c079; color: #111; }
.operator { left: 13%; top: 69%; }
.builder { left: 20%; top: 56%; }
.dependency { left: 50%; top: 42%; }
.gate { left: 79%; top: 51%; }
.finish { left: 93%; top: 43%; }
.control-deck { align-items: flex-end; }
.status-copy { max-width: 520px; }
.status-copy p:last-child { margin-bottom: 0; line-height: 1.5; }
.actions, .replay { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
button { font: inherit; }
.actions button, .replay button {
  background: #17232e;
  border: 1px solid #465666;
  color: #e9edf1;
  padding: 10px 13px;
  border-radius: 6px;
  cursor: pointer;
}
.actions button:hover:not(:disabled), .replay button:hover:not(:disabled) { border-color: #9fb1c2; }
button:disabled { opacity: .3; cursor: not-allowed; }
.replay span { align-self: center; font-size: 11px; opacity: .65; padding: 0 6px; }
@media (max-width: 760px) {
  .baton-shell { padding: 12px; }
  .field { min-height: 500px; }
  .operator { left: 13%; top: 79%; }
  .builder { left: 24%; top: 61%; }
  .dependency { left: 49%; top: 41%; }
  .gate { left: 73%; top: 55%; }
  .finish { left: 88%; top: 29%; }
  .node { min-width: 88px; padding: 9px; font-size: 10px; }
  .control-deck { display: grid; }
  .actions, .replay { justify-content: flex-start; }
}
</style>
