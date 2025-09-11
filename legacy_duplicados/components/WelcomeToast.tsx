import React, { useState, useEffect } from 'react'

const MESSAGE = `Estás en tu refugio y debes sobrevivir.
Recoge cartas y decide por tu vida. Explora y recolecta objetos.
Investiga notas e historia del juego.
Recuerda que el tiempo avanza con cada acción: utiliza bien tu tiempo.

Crea tu personaje inicial cambiando el nombre y agregando una bio.
Agrega personajes presionando “+ Agregar”.
El juego empieza cuando presionas Play y puedes pausar en cualquier momento.`

export default function WelcomeToast() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('welcomeSeen')) return
    setVisible(true)
  }, [])

  if (!visible) return null

  const close = () => {
    localStorage.setItem('welcomeSeen', '1')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="max-w-md mx-auto card card-red p-6 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Bienvenido</h2>
        <p className="whitespace-pre-line text-left">{MESSAGE}</p>
        <button className="btn btn-red text-white px-4 py-2 rounded" onClick={close}>
          Entendido
        </button>
      </div>
    </div>
  )
}
