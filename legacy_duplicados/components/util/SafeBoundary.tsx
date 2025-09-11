import React from "react";

type State = { hasError: boolean; message?: string };

export default class SafeBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(p:any){ super(p); this.state = { hasError:false, message:"" }; }
  static getDerivedStateFromError(err:any){ return { hasError:true, message:String(err?.message ?? err) }; }
  componentDidCatch(err:any, info:any){ console.error("[SafeBoundary] error:", err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen bg-black text-white p-4">
          <div className="max-w-2xl mx-auto bg-zinc-900/90 border border-white/10 rounded-2xl p-6">
            <h1 className="text-lg font-bold mb-2">Algo se rompió…</h1>
            <p className="text-sm opacity-80 mb-3">Capturamos el error para que el juego no quede en negro.</p>
            <pre className="text-xs bg-black/40 p-3 rounded border border-white/10 overflow-auto">{this.state.message}</pre>
            <button className="mt-4 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500" onClick={()=>location.reload()}>Recargar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
