import React, { useMemo, useState } from "react";
import type { AnyCard } from "@/lib/deck";
import {
  drawOne,
  discardById,
  reintegrateDiscards,
  shuffleDrawPile,
  isStory,
  isCombat,
} from "@/lib/deck";
import type { DeckBundle, ChoiceEffect } from "@/lib/deck";

type LogType =
  | "info"
  | "combat"
  | "danger"
  | "success"
  | "story"
  | "death"
  | "level"
  | "resource"
  | "moral"
  | "system";

type Props = {
  storyDeck: DeckBundle;
  combatDeck: DeckBundle;
  /** Ejecuta los efectos elegidos; debe encaminar a tu `handleStoryChoice` */
  onChoose: (effect: ChoiceEffect, sourceCard: AnyCard) => void;
  /** Avanza el turno cuando el jugador decide “pasar” */
  onPassTurn: () => void;
  /** (Opcional) Para registrar mensajes en tu bitácora */
  onLog?: (msg: string, type?: LogType) => void;
};

export default function DeckUI({
  storyDeck,
  combatDeck,
  onChoose,
  onPassTurn,
  onLog,
}: Props) {
  const [current, setCurrent] = useState<AnyCard | null>(null);
  // “tick” para forzar rerender cuando mutamos el estado del mazo
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const storyCount = useMemo(
    () => ({
      draw: storyDeck.state.drawPile.length,
      disc: storyDeck.state.discardPile.length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, storyDeck.state.drawPile.length, storyDeck.state.discardPile.length]
  );

  const combatCount = useMemo(
    () => ({
      draw: combatDeck.state.drawPile.length,
      disc: combatDeck.state.discardPile.length,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [version, combatDeck.state.drawPile.length, combatDeck.state.discardPile.length]
  );

  function draw(kind: "story" | "combat") {
    const deck = kind === "story" ? storyDeck : combatDeck;
    const card = drawOne(deck);
    bump();
    if (!card) {
      onLog?.(
        kind === "story"
          ? "No quedan cartas de decisión. Reintegra o baraja."
          : "No quedan cartas de combate. Reintegra o baraja.",
        kind === "story" ? "story" : "combat"
      );
      return;
    }
    setCurrent(card);
    onLog?.(
      `Robas carta: ${card.title}`,
      kind === "story" ? "story" : "combat"
    );
  }

  function discardCurrent() {
    if (!current) return;
    // Entra al montón de descartes correspondiente
    const deck = isStory(current) ? storyDeck : combatDeck;
    discardById(deck, current.id);
    bump();
    setCurrent(null);
  }

  function choose(effect: ChoiceEffect) {
    if (!current) return;
    // Ejecuta efectos arriba (motor del juego)
    onChoose(effect, current);
    // Descarta y limpia
    const deck = isStory(current) ? storyDeck : combatDeck;
    discardById(deck, current.id);
    bump();
    setCurrent(null);
  }

  function shuffle(kind: "story" | "combat") {
    const deck = kind === "story" ? storyDeck : combatDeck;
    shuffleDrawPile(deck);
    bump();
    onLog?.(
      kind === "story" ? "Barajas el mazo de decisión." : "Barajas el mazo de combate.",
      "system"
    );
  }

  function reintegrate(kind: "story" | "combat") {
    const deck = kind === "story" ? storyDeck : combatDeck;
    reintegrateDiscards(deck);
    bump();
    onLog?.(
      kind === "story"
        ? "Reintegras descartes al mazo de decisión."
        : "Reintegras descartes al mazo de combate.",
      "system"
    );
  }

  const frameClasses =
    current && isCombat(current)
      ? "border-red-700 from-red-950/40 to-neutral-950"
      : "border-purple-700 from-purple-950/40 to-neutral-950";

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
      <h3 className="text-2xl font-bold mb-4">🃏 Mazos</h3>

      {/* Controles de mazos */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Mazo de DECISIÓN (morado) */}
        <div className="p-4 rounded-xl border border-purple-800 bg-purple-950/10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-purple-300">Decisión (Morado)</span>
            <div className="text-xs text-neutral-400">
              Robar: <b>{storyCount.draw}</b> • Descartes: <b>{storyCount.disc}</b>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => draw("story")}
              className="px-3 py-2 bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 rounded-lg font-semibold transition-all"
            >
              🎴 Robar
            </button>
            <button
              onClick={() => shuffle("story")}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all"
            >
              🔀 Barajar
            </button>
            <button
              onClick={() => reintegrate("story")}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all"
            >
              ♻️ Reintegrar descartes
            </button>
          </div>
        </div>

        {/* Mazo de COMBATE (rojo) */}
        <div className="p-4 rounded-xl border border-red-800 bg-red-950/10">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-red-300">Combate (Rojo)</span>
            <div className="text-xs text-neutral-400">
              Robar: <b>{combatCount.draw}</b> • Descartes: <b>{combatCount.disc}</b>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => draw("combat")}
              className="px-3 py-2 bg-gradient-to-r from-red-800 to-red-900 hover:from-red-700 hover:to-red-800 rounded-lg font-semibold transition-all"
            >
              🗡️ Robar
            </button>
            <button
              onClick={() => shuffle("combat")}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all"
            >
              🔀 Barajar
            </button>
            <button
              onClick={() => reintegrate("combat")}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all"
            >
              ♻️ Reintegrar descartes
            </button>
          </div>
        </div>
      </div>

      {/* Vista de carta actual */}
      <div className="mt-6">
        {current ? (
          <div
            className={`bg-gradient-to-br ${frameClasses} border-2 rounded-2xl p-6 shadow-2xl animate-fade-in`}
          >
            <div className="flex items-start justify-between gap-4">
              <h4 className="text-2xl font-bold">
                {current.title}
              </h4>
              <span
                className={`px-2 py-1 rounded-md text-xs ${
                  isCombat(current)
                    ? "bg-red-900/40 text-red-300 border border-red-800"
                    : "bg-purple-900/40 text-purple-300 border border-purple-800"
                }`}
              >
                {isCombat(current) ? "Combate" : "Decisión"}
              </span>
            </div>

            <p className="text-neutral-300 leading-relaxed text-base mt-2">
              {current.text}
            </p>

            {/* Cita filosófica si existe (solo en cartas de decisión) */}
            {"citation" in current && current.citation ? (
              <div className="mt-4 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-sm italic text-neutral-400">
                “{current.citation.quote}” — {current.citation.author}
              </div>
            ) : null}

            <div className="grid md:grid-cols-3 gap-3 mt-6">
              {current.choices.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => choose(ch.effect)}
                  className={`group p-4 rounded-xl text-left transition-all transform hover:scale-[1.02] border
                    ${
                      isCombat(current)
                        ? "bg-red-950/20 border-red-800 hover:border-red-600"
                        : "bg-purple-950/20 border-purple-800 hover:border-purple-600"
                    }`}
                >
                  <span
                    className={`text-base font-semibold block group-hover:opacity-90 ${
                      isCombat(current) ? "text-red-200" : "text-purple-200"
                    }`}
                  >
                    → {ch.text}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={() => {
                  onPassTurn();
                  discardCurrent();
                }}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all border border-neutral-700"
              >
                ⏭️ Pasar turno
              </button>
              <button
                onClick={discardCurrent}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all border border-neutral-700"
              >
                🗂️ Descartar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-neutral-900/40 rounded-2xl border border-neutral-800">
            <p className="text-neutral-400">
              Roba una carta de alguno de los mazos para continuar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
