import React from 'react';

export function shouldShow(state: any) {
  return state?.combat?.status === 'finished' &&
    (state?.combat?.rounds?.length ?? 0) > 0 &&
    !!state?.combat?.result;
}

export default function BattleSummaryModal({ state, children }: { state: any; children?: React.ReactNode }) {
  return shouldShow(state) ? <div>{children}</div> : null;
}
