export default function AdminFooter() {
  const year = new Date().getFullYear();

  const css = `
    .adm-footer {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 28px;
      background: rgba(3, 3, 14, 0.95);
      border-top: 1px solid rgba(0, 255, 225, 0.1);
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      color: rgba(224, 248, 255, 0.22);
      overflow: hidden;
      flex-shrink: 0;
    }

    /* Animated top trace line */
    .adm-footer::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 255, 225, 0.4) 20%,
        rgba(245, 255, 0, 0.3) 50%,
        rgba(255, 0, 110, 0.4) 80%,
        transparent 100%
      );
      animation: footerTrace 4s ease-in-out infinite;
    }
    @keyframes footerTrace {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.9; }
    }

    .adm-footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
    }
    .adm-footer-brand-dot {
      width: 4px;
      height: 4px;
      background: var(--cp-cyan, #00ffe1);
      box-shadow: 0 0 6px var(--cp-cyan, #00ffe1);
      clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
      animation: footerDot 2s ease-in-out infinite;
    }
    @keyframes footerDot {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    .adm-footer-brand-name {
      color: rgba(0, 255, 225, 0.35);
    }
    .adm-footer-brand-sep {
      color: rgba(255, 0, 110, 0.25);
      font-size: 0.5rem;
    }
    .adm-footer-brand-sub {
      color: rgba(224, 248, 255, 0.15);
    }

    .adm-footer-right {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .adm-footer-status {
      display: flex;
      align-items: center;
      gap: 5px;
      color: rgba(0, 255, 225, 0.25);
    }
    .adm-footer-status-dot {
      width: 5px;
      height: 5px;
      background: rgba(0, 255, 225, 0.5);
      border-radius: 50%;
      box-shadow: 0 0 5px rgba(0, 255, 225, 0.5);
      animation: footerDot 1.5s ease-in-out infinite;
    }
    .adm-footer-year {
      color: rgba(245, 255, 0, 0.2);
    }
  `;

  return (
    <>
      <style>{css}</style>
      <footer className="adm-footer">
        <div className="adm-footer-brand">
          <div className="adm-footer-brand-dot" />
          <span className="adm-footer-brand-name">DQD_GAMING</span>
          <span className="adm-footer-brand-sep">◆</span>
          <span className="adm-footer-brand-sub">Admin Console</span>
        </div>
        <div className="adm-footer-right">
          <div className="adm-footer-status">
            <div className="adm-footer-status-dot" />
            <span>SYS_ACTIVE</span>
          </div>
          <span className="adm-footer-year">// {year}</span>
        </div>
      </footer>
    </>
  );
}