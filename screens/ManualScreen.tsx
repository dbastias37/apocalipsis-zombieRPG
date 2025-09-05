import React, { useState } from 'react'
import { useGameState } from '@/state/gameState'

const pages = [
  (
    <div className="space-y-4" key="p1">
      <h2 className="text-2xl font-bold">Página 1/2 — Conceptos básicos</h2>
      <p><b>Objetivo:</b> Sobrevive al apocalipsis, protege tu refugio y gestiona tus recursos.</p>
      <p><b>Turnos y tiempo:</b> Cada acción hace avanzar el tiempo. Piensa antes de actuar.</p>
      <p><b>Exploración:</b> Sal del refugio para buscar cartas, recursos y pistas.</p>
      <p><b>Riesgos:</b> Encuentros, heridas, fatiga y eventos dinámicos.</p>
      <p><b>Inventario:</b> Administra equipo, comida, medicinas y materiales.</p>
      <p><b>Cartas:</b> Otorgan acciones, eventos, ventajas o desventajas.</p>
    </div>
  ),
  (
    <div className="space-y-4" key="p2">
      <h2 className="text-2xl font-bold">Página 2/2 — Flujo de juego</h2>
      <p><b>Refugio:</b> Punto seguro inicial. Repara, fabrica y organiza tu equipo.</p>
      <p><b>Personajes:</b> Comienzas con “jugador1” (editable). Podrás agregar más personajes luego.</p>
      <p><b>Acciones y costo temporal:</b> Explorar, saquear, curar, fabricar, investigar.</p>
      <p><b>Notas e historia:</b> Lee documentos y pistas para comprender el mundo y desbloquear ventajas.</p>
      <p><b>Pausa/Play:</b> El juego empieza en PAUSA. Presiona Play para avanzar el tiempo. Puedes pausar en cualquier momento.</p>
      <p><b>Sugerencia:</b> Empieza por ajustar tu personaje, revisar inventario y planificar tu primera salida.</p>
    </div>
  ),
]

export default function ManualScreen() {
  const [page, setPage] = useState(0)
  const { setPhase, upsertPersonaje, roster, setHasSeenManual } = useGameState()

  const next = () => setPage((p) => Math.min(1, p + 1))
  const prev = () => setPage((p) => Math.max(0, p - 1))

  const startGame = () => {
    if (!roster.find((r) => r.id === 'jugador1')) {
      upsertPersonaje({
        id: 'jugador1',
        name: 'jugador1',
        profession: 'Superviviente',
        bio: 'Personaje inicial editable.',
        stats: {},
      })
    }
    setHasSeenManual(true)
    setPhase('paused')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="card card-red p-6 max-w-2xl w-full space-y-6">
        {pages[page]}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-700">
          <button className="px-3 py-1 rounded bg-neutral-800" onClick={prev} disabled={page === 0}>
            ‹ Anterior
          </button>
          {page === pages.length - 1 ? (
            <button className="btn btn-red text-white px-4 py-2 rounded" onClick={startGame}>
              Iniciar juego
            </button>
          ) : (
            <button className="px-3 py-1 rounded bg-neutral-800" onClick={next}>
              Siguiente ›
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
