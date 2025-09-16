let logEl: HTMLElement | null = null
const pending: string[] = []
const MAX_ENTRIES = 400

function ensureLogger(selector = '#gameLog') {
  if (logEl && document.contains(logEl)) return logEl
  logEl = document.querySelector<HTMLElement>(selector)
  return logEl
}

function pushMessage(message: string) {
  if (!logEl) return
  const entry = document.createElement('div')
  entry.textContent = message
  logEl.appendChild(entry)
  if (logEl.children.length > MAX_ENTRIES) {
    logEl.removeChild(logEl.firstChild as ChildNode)
  }
  logEl.scrollTop = logEl.scrollHeight
}

export function initLogger(selector = '#gameLog') {
  logEl = typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : (selector as HTMLElement | null)
  if (logEl && pending.length) {
    const queued = [...pending]
    pending.length = 0
    queued.forEach(pushMessage)
  }
}

export function appendLog(message: string) {
  if (!ensureLogger()) {
    pending.push(message)
    return
  }
  if (pending.length) {
    const queued = [...pending, message]
    pending.length = 0
    queued.forEach(pushMessage)
    return
  }
  pushMessage(message)
}
