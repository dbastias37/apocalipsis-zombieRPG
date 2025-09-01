import React, { useMemo, useState } from 'react'
import DeckUI from '@/components/DeckUI'
import { createDualDecks } from '@/lib/deck'
import storyCards from '@/data/storyCards'
import combatCards from '@/data/combatCards'
import type { ChoiceEffect } from '@/lib/deck'

type Resources = { food:number; water:number; medicine:number; fuel:number; ammo:number; materials:number }
type LogType = 'info'|'combat'|'danger'|'success'|'story'|'death'|'level'|'resource'|'moral'|'system'

export default function App() {
  const [morale, setMorale] = useState(50)
  const [day, setDay] = useState(1)
  const [turn, setTurn] = useState(1)
  const [resources, setResources] = useState<Resources>({ food:15, water:15, medicine:8, fuel:10, ammo:30, materials:10 })
  const [log, setLog] = useState<string[]>([])
  const [survivors, setSurvivors] = useState(3)

  const { storyDeck, combatDeck } = useMemo(() => createDualDecks(storyCards as any, combatCards as any), [])

  function onLog(msg: string, type: LogType = 'info') {
    const icons: Record<LogType,string> = {info:'📝', combat:'⚔️', danger:'⚠️', success:'✅', story:'📖', death:'💀', level:'⭐', resource:'📦', moral:'💭', system:'⚙️'}
    const stamp = new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})
    setLog(prev => [`${icons[type]} [${stamp} - Día ${day}] ${msg}`, ...prev].slice(0,100))
  }

  function applyEffect(effect: ChoiceEffect) {
    const keys: (keyof Resources)[] = ['food','water','medicine','fuel','ammo','materials']
    setResources(prev => {
      const next = { ...prev }
      keys.forEach(k => {
        if (typeof (effect as any)[k] === 'number') {
          next[k] = Math.max(0, next[k] + Number((effect as any)[k]))
          if (Number((effect as any)[k]) !== 0) onLog(`${Number((effect as any)[k])>0?'+':''}${(effect as any)[k]} ${k}`, 'resource')
        }
      })
      return next
    })
    if (typeof effect.morale === 'number') {
      setMorale(m => Math.max(0, Math.min(100, m + effect.morale!)))
      onLog(`Moral ${effect.morale!>0?'aumenta':'disminuye'}: ${effect.morale}`, 'moral')
    }
    if (typeof effect.survivors === 'number' && effect.survivors>0) {
      setSurvivors(s => s + effect.survivors!)
      onLog(`Se unen ${effect.survivors} supervivientes`, 'success')
    }
    if (typeof effect.zombies === 'number' && effect.zombies>0) onLog(`¡Aparecen ${effect.zombies} enemigos!`, 'danger')
    if (effect.casualties === 'random') onLog(`Se producen bajas aleatorias durante el evento`, 'danger')
    if (typeof effect.karma === 'number') onLog(`Karma ${effect.karma>0?'+':''}${effect.karma}`, 'info')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-black to-neutral-950">
      <header className="sticky top-0 z-40 bg-gradient-to-b from-black via-neutral-950/95 to-transparent backdrop-blur-md border-b border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">
              🧟 Apocalipsis Zombie RPG
            </h1>
            <div className="flex gap-2 text-xs">
              <span className="px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800">📅 Día {day}</span>
              <span className="px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800">🔄 Turno {turn}</span>
              <span className="px-2 py-1 bg-neutral-900 rounded-lg border border-neutral-800">👥 {survivors}</span>
            </div>
          </div>
          <div className="flex gap-3 text-sm px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
            <span className={resources.food<5?'text-red-400 animate-pulse':''}>🍖 {resources.food}</span>
            <span className={resources.water<5?'text-red-400 animate-pulse':''}>💧 {resources.water}</span>
            <span className={resources.medicine<3?'text-red-400 animate-pulse':''}>💊 {resources.medicine}</span>
            <span>⛽ {resources.fuel}</span><span>🔫 {resources.ammo}</span><span>🔨 {resources.materials}</span>
            <span className="ml-3">💭 {morale}%</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <DeckUI
          storyDeck={storyDeck}
          combatDeck={combatDeck}
          onChoose={(eff) => { applyEffect(eff); setTurn(t=>t+1); }}
          onPassTurn={() => { setTurn(t=>t+1); onLog('Pasas el turno.', 'info') }}
          onLog={onLog}
        />
        <section className="bg-gradient-to-br from-neutral-900 to-black border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-bold">📜 Registro</h3>
            <button onClick={() => setLog([])} className="px-3 py-1 bg-red-900 hover:bg-red-800 rounded-lg text-sm transition-all">🗑️ Limpiar</button>
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {log.length===0 ? <p className="text-neutral-500 text-center py-8">No hay eventos registrados</p> :
              log.map((e,i)=> <div key={i} className="text-sm p-3 rounded-lg border border-neutral-700 bg-neutral-800/50 animate-fade-in">{e}</div>)}
          </div>
        </section>
      </main>
    </div>
  )
}
