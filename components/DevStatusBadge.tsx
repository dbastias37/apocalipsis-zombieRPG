import React, { useEffect, useState } from 'react';

interface Props {
  state: string;
  showStart: boolean;
  playersLen: number;
  turnIndex: number;
  day?: number;
  timers: { clock: boolean; event: boolean };
}

const DevStatusBadge: React.FC<Props> = ({ state, showStart, playersLen, turnIndex, day, timers }) => {
  if (import.meta.env.PROD) return null;
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const orig = console.error;
    console.error = (...args: any[]) => {
      setError(String(args[0]));
      orig(...args);
    };
    return () => {
      console.error = orig;
    };
  }, []);
  return (
    <div className="fixed bottom-2 left-2 z-50 bg-black/80 text-white text-xs p-2 rounded">
      <div>state: {state}</div>
      <div>showStart: {String(showStart)}</div>
      <div>players: {playersLen}</div>
      <div>turn: {turnIndex}</div>
      <div>day: {day ?? '-'}</div>
      <div>clock: {timers.clock ? 'on' : 'off'}</div>
      <div>event: {timers.event ? 'on' : 'off'}</div>
      {error && <div className="text-red-400">err: {error}</div>}
    </div>
  );
};

export default DevStatusBadge;
