Hooks.once("ready", () => {
  if (globalThis.__swrpgNarrativeDieInstalled) return;
  globalThis.__swrpgNarrativeDieInstalled = true;

  const LABELS = {
    1: "Despair",
    2: "Threat",
    3: "Threat",
    4: "Neutral",
    5: "Neutral",
    6: "Advantage",
    7: "Advantage",
    8: "Triumph"
  };

  async function postNarrativeDie(title, speaker) {
    const roll = await new Roll("1d8").evaluate({ async: true });
    const result = LABELS[roll.total] ?? "Neutral";

    await roll.toMessage({
      speaker,
      flavor: `${title}: <strong>${result}</strong>`
    });
  }

  const speakerFor = (actor) => ChatMessage.getSpeaker({ actor });

  Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {
    const actor = workflow?.actor;
    if (!actor) return;
    await postNarrativeDie(`${workflow.item?.name ?? "Attack"} narrative die`, speakerFor(actor));
  });

  Hooks.on("dnd5e.rollSkill", async (_rolls, data) => {
    const actor = data?.subject;
    if (!actor) return;
    const skillLabel = data.skill ? (CONFIG.DND5E.skills?.[data.skill]?.label ?? data.skill) : "Skill";
    await postNarrativeDie(`${skillLabel} check narrative die`, speakerFor(actor));
  });

  Hooks.on("dnd5e.rollAbilityCheck", async (_rolls, data) => {
    const actor = data?.subject;
    if (!actor) return;
    const abilityLabel = data.ability ? (CONFIG.DND5E.abilities?.[data.ability]?.label ?? data.ability) : "Ability";
    await postNarrativeDie(`${abilityLabel} check narrative die`, speakerFor(actor));
  });

  Hooks.on("dnd5e.rollSavingThrow", async (_rolls, data) => {
    const actor = data?.subject;
    if (!actor) return;
    const abilityLabel = data.ability ? (CONFIG.DND5E.abilities?.[data.ability]?.label ?? data.ability) : "Save";
    await postNarrativeDie(`${abilityLabel} save narrative die`, speakerFor(actor));
  });
});
