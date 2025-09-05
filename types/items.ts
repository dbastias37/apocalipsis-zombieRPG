export type AmmoBox = {
  id: string;
  name: string;
  type: "ammo_box";
  bullets: number;
};

export type BackpackItem = AmmoBox | { id: string; name: string; type: string; [key: string]: any };
