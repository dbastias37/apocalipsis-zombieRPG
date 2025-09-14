export function getEnergy(p:any){ return Number.isFinite(p?.energy) ? p.energy : 0; }
export function getEnergyMax(p:any){ return Number.isFinite(p?.energyMax) ? p.energyMax : 100; }
export function withEnergy(p:any, next:number){ return { ...p, energy: Math.max(0, Math.min(getEnergyMax(p), Math.floor(next))) }; }
