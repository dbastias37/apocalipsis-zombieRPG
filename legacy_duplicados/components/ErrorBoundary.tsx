import React from "react";

interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-red-500 flex items-center justify-center p-4">
          <div className="max-w-lg">
            <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
            <pre className="whitespace-pre-wrap text-sm">{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

