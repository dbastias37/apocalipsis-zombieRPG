export interface ContainersState {
  openedIdsByDay: Record<number, Set<string>>;
  lastOpenedWasContainer: boolean;
}

export interface GameState {
  resources: { ammo: number; [k: string]: any };
  containersState: ContainersState;
}
