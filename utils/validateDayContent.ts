import { DayContent, NextDayModifiers } from "@/types/day";

function isNumber(n: any): n is number {
  return typeof n === "number" && !isNaN(n);
}

function checkModifiers(mods: NextDayModifiers | undefined, ctx: string, errs: string[]) {
  if (!mods) return;
  if (mods.hordeIntensity !== undefined && !isNumber(mods.hordeIntensity))
    errs.push(`${ctx}.nextDayModifiers.hordeIntensity debe ser número`);
  if (mods.shopPricesMultiplier !== undefined && !isNumber(mods.shopPricesMultiplier))
    errs.push(`${ctx}.nextDayModifiers.shopPricesMultiplier debe ser número`);
  if (mods.eventUnlocks && !Array.isArray(mods.eventUnlocks))
    errs.push(`${ctx}.nextDayModifiers.eventUnlocks debe ser array`);
}

export function validateDayContent(day: number, content: DayContent) {
  if (!import.meta.env.DEV) return;
  const errs: string[] = [];

  content.decisions.forEach((d, i) => {
    if (!d.id) errs.push(`Decision[${i}] falta id`);
    if (d.day !== day) errs.push(`Decision ${d.id} day ${d.day} != ${day}`);
    if (!d.title) errs.push(`Decision ${d.id} falta title`);
    if (!Array.isArray(d.options)) errs.push(`Decision ${d.id} options inválido`);
    d.options?.forEach((opt, j) => {
      if (!opt.id) errs.push(`Decision ${d.id} option[${j}] sin id`);
      if (!opt.label) errs.push(`Decision ${d.id} option[${j}] sin label`);
      checkModifiers(opt.outcome?.nextDayModifiers, `Decision ${d.id} option ${opt.id}`, errs);
    });
  });

  content.battles.forEach((b, i) => {
    if (!b.id) errs.push(`Battle[${i}] falta id`);
    if (b.day !== day) errs.push(`Battle ${b.id} day ${b.day} != ${day}`);
    if (!b.title) errs.push(`Battle ${b.id} falta title`);
  });

  content.exploration.forEach((e, i) => {
    if (!e.id) errs.push(`Exploration[${i}] falta id`);
    if (e.day !== day) errs.push(`Exploration ${e.id} day ${e.day} != ${day}`);
    if (!e.location) errs.push(`Exploration ${e.id} falta location`);
  });

  if (errs.length) {
    console.error("[DayContent:validation]", errs.join("; "));
  }
}
