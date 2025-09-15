import { playerOwnsWeapon } from '../../systems/weapons';

type WeaponSelectorProps = {
  player: any;
  onEquip: (weaponId: string) => void;
};

export default function WeaponSelector({ player, onEquip }: WeaponSelectorProps) {
  if (!player) return null;
  const options = [
    { id:'fists',   label:'Puños' },
    ...(playerOwnsWeapon(player,'knife')   ? [{ id:'knife',   label:'Navaja' }]   : []),
    ...(playerOwnsWeapon(player,'pistol9') ? [{ id:'pistol9', label:'Pistola 9mm' }] : []),
  ];
  const current = player?.equippedWeaponId ?? 'fists';
  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs text-white/70">Seleccionar arma</span>
      <select
        value={current}
        onChange={e => onEquip(e.target.value)}
        className="bg-zinc-800 text-white rounded px-2 py-1 text-sm"
      >
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}
