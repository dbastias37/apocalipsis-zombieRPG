import React from "react";

export class ErrorBoundary extends React.Component<{fallback?: React.ReactNode}, {hasError: boolean; err?: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err: any) {
    return { hasError: true, err };
  }

  componentDidCatch(err: any, info: any) {
    console.error("UI Crash:", err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="card card-red p-6 max-w-lg">
              <h2 className="text-xl font-bold mb-2">Algo falló</h2>
              <p className="text-sm text-neutral-300">Intenta volver al inicio o recargar.</p>
              <div className="mt-4 flex gap-3">
                <button className="btn btn-red" onClick={() => window.location.reload()}>Recargar</button>
              </div>
            </div>
          </div>
        )
      );
    }
    return this.props.children as any;
  }
}
