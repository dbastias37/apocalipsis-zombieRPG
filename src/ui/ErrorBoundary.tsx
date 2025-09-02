import React from "react";

type State = { hasError: boolean; msg?: string };

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: any) {
    return { hasError: true, msg: String(err) };
  }

  componentDidCatch(err: any, info: any) {
    console.error("UI error:", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <h2 className="text-red-500 font-bold">Algo salió mal</h2>
          <p className="text-sm text-neutral-400">{this.state.msg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
