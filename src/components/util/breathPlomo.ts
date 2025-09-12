export function ensureBreathPlomoStyle(){
  const id = "breath-plomo-style";
  if (typeof document === "undefined") return;
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
      @keyframes breath-plomo {
        0%   { transform: scale(1);    box-shadow: 0 0 0 rgba(150,150,150,0.0); }
        50%  { transform: scale(1.02); box-shadow: 0 0 18px rgba(150,150,150,0.25); }
        100% { transform: scale(1);    box-shadow: 0 0 0 rgba(150,150,150,0.0); }
      }
      .breath-plomo {
        animation: breath-plomo 2.4s ease-in-out infinite;
        border: 1px solid #3d3d3d;
      }
      .btn-disabled {
        opacity: .45; cursor: not-allowed; filter: grayscale(0.4);
      }
    `;
  document.head.appendChild(style);
}
