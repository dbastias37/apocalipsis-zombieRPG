import React from 'react'

interface Props {
  onStart: () => void
  onClose: () => void
}

export default function WelcomeOverlay({ onStart, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="max-w-3xl w-full rounded-2xl border border-red-700 bg-black/80 backdrop-blur p-6 shadow-2xl space-y-2">
        <h2 className="text-xl font-bold mb-2">Bienvenido</h2>
        <p>Estás en tu refugio y debes sobrevivir.</p>
        <p>
          <b>Recoge cartas</b> y decide por tu vida. <b>Explora</b> y <b>recolecta objetos</b>.
        </p>
        <p>Investiga notas e historia del juego.</p>
        <p className="mb-2">
          <b>El tiempo avanza con cada acción</b>: utiliza bien tu tiempo.
        </p>
        <p className="mb-4">
          <b>Crea tu personaje inicial</b> cambiando el nombre y agregando una bio.
          <br />
          <b>Agrega personajes</b> con “+ Agregar”.
          <br />El juego <b>empieza cuando presionas Play</b> y puedes pausar en cualquier momento.
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button className="px-4 py-2 rounded bg-neutral-700 hover:bg-neutral-600" onClick={onClose}>
            Entendido
          </button>
          <button className="px-4 py-2 rounded bg-red-700 hover:bg-red-600 text-white" onClick={onStart}>
            Iniciar juego
          </button>
        </div>
      </div>
    </div>
  )
}
