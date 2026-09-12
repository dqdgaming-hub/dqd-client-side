// adminTheme.js — shared cyberpunk CSS for all admin pages
// Import and inject via: <style>{adminCss}</style>  (or import into a global stylesheet)

export const adminCss = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&display=swap');

  :root {
    --cp-void:    #05050f;
    --cp-cyan:    #00ffe1;
    --cp-pink:    #ff006e;
    --cp-yellow:  #f5ff00;
    --cp-purple:  #7b2fff;
    --cp-text:    #e0f8ff;
    --cp-muted:   rgba(224,248,255,0.28);
    --cp-panel:   rgba(8,8,24,0.85);
    --cp-border:  rgba(0,255,225,0.1);
  }

  /* ── Reset ── */
  .adm-pg * { box-sizing: border-box; margin: 0; padding: 0; }
  .adm-pg   { font-family: 'Share Tech Mono', monospace; color: var(--cp-text); }

  /* ══════════════════════════════════════════
     PAGE HERO
  ══════════════════════════════════════════ */
  .adm-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--cp-border);
    position: relative;
  }
  .adm-hero::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0;
    width: 120px; height: 1px;
    background: linear-gradient(90deg, var(--cp-cyan), transparent);
    box-shadow: 0 0 8px rgba(0,255,225,0.4);
  }
  .adm-kicker {
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.45);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .adm-kicker::before { content: '//'; color: rgba(0,255,225,0.25); }
  .adm-h1 {
    font-family: 'Orbitron', monospace;
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1.05;
    color: var(--cp-text);
    margin-bottom: 6px;
  }
  .adm-h1 span { color: var(--cp-cyan); text-shadow: 0 0 18px rgba(0,255,225,0.55); }
  .adm-hero-sub {
    font-size: 0.7rem;
    color: var(--cp-muted);
    letter-spacing: 0.04em;
  }
  .adm-hero-sub::before { content: '> '; color: rgba(0,255,225,0.25); }

  /* ══════════════════════════════════════════
     PANEL
  ══════════════════════════════════════════ */
  .adm-panel {
    background: var(--cp-panel);
    border: 1px solid var(--cp-border);
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
    position: relative;
    overflow: hidden;
    margin-bottom: 14px;
  }
  .adm-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--cp-cyan), rgba(245,255,0,0.5), transparent);
    opacity: 0.35;
  }
  .adm-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(0,255,225,0.07);
  }
  .adm-panel-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--cp-text);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .adm-panel-title::before {
    content: '';
    display: inline-block;
    width: 3px; height: 12px;
    background: var(--cp-cyan);
    box-shadow: 0 0 6px var(--cp-cyan);
  }
  .adm-panel-body { padding: 20px 18px; }

  /* ══════════════════════════════════════════
     FORM ELEMENTS
  ══════════════════════════════════════════ */
  .adm-field { margin-bottom: 18px; }
  .adm-label {
    display: block;
    font-size: 0.58rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.45);
    margin-bottom: 6px;
  }
  .adm-label::before { content: '// '; color: rgba(0,255,225,0.2); }

  .adm-input,
  .adm-select,
  .adm-textarea {
    width: 100%;
    background: rgba(0,255,225,0.03);
    border: 1px solid rgba(0,255,225,0.18);
    color: var(--cp-text);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.78rem;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    appearance: none;
    -webkit-appearance: none;
  }
  .adm-input::placeholder,
  .adm-textarea::placeholder {
    color: rgba(224,248,255,0.2);
    letter-spacing: 0.06em;
  }
  .adm-input:focus,
  .adm-select:focus,
  .adm-textarea:focus {
    border-color: rgba(0,255,225,0.45);
    background: rgba(0,255,225,0.05);
    box-shadow: 0 0 0 1px rgba(0,255,225,0.12) inset, 0 0 14px rgba(0,255,225,0.06);
  }
  .adm-select {
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2300ffe1' opacity='.4'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 30px;
  }
  .adm-select option { background: #0a0a1e; color: var(--cp-text); }
  .adm-textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

  /* Checkbox row */
  .adm-check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
  }
  .adm-check-row input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 16px; height: 16px;
    border: 1px solid rgba(0,255,225,0.3);
    background: transparent;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: border-color 0.2s, background 0.2s;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%);
  }
  .adm-check-row input[type="checkbox"]:checked {
    background: rgba(0,255,225,0.15);
    border-color: var(--cp-cyan);
  }
  .adm-check-row input[type="checkbox"]:checked::after {
    content: '✓';
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    color: var(--cp-cyan);
    text-shadow: 0 0 6px var(--cp-cyan);
  }
  .adm-check-label {
    font-size: 0.7rem;
    color: rgba(224,248,255,0.55);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* File input */
  .adm-file-wrap { position: relative; }
  .adm-file-wrap input[type="file"] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .adm-file-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(0,255,225,0.03);
    border: 1px dashed rgba(0,255,225,0.22);
    color: rgba(224,248,255,0.35);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .adm-file-btn:hover { border-color: rgba(0,255,225,0.4); color: rgba(0,255,225,0.7); }
  .adm-file-name { color: rgba(0,255,225,0.6); font-size: 0.68rem; margin-top: 4px; }

  /* ══════════════════════════════════════════
     BUTTONS
  ══════════════════════════════════════════ */
  /* Primary */
  .adm-btn-primary {
    position: relative;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 22px;
    height: 42px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: 'Orbitron', monospace;
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #000;
    transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    flex-shrink: 0;
  }
  .adm-btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }
  .adm-btn-primary-bg {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--cp-cyan) 0%, #00c8b0 50%, var(--cp-yellow) 100%);
  }
  .adm-btn-primary-hover {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--cp-yellow) 0%, var(--cp-cyan) 100%);
    opacity: 0;
    transition: opacity 0.25s;
  }
  .adm-btn-primary:hover .adm-btn-primary-hover { opacity: 1; }
  .adm-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 30px rgba(0,255,225,0.35); }
  .adm-btn-primary:active { transform: scale(0.98); }
  .adm-btn-primary-inner {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 7px;
    font-weight: 700; color: #000;
  }

  /* Ghost */
  .adm-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 14px;
    height: 32px;
    background: transparent;
    border: 1px solid rgba(0,255,225,0.2);
    color: rgba(0,255,225,0.5);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
    text-decoration: none;
  }
  .adm-btn-ghost:hover {
    border-color: rgba(0,255,225,0.5);
    color: var(--cp-cyan);
    background: rgba(0,255,225,0.05);
    box-shadow: 0 0 12px rgba(0,255,225,0.1);
  }

  /* Danger */
  .adm-btn-danger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    height: 28px;
    background: transparent;
    border: 1px solid rgba(255,0,110,0.25);
    color: rgba(255,0,110,0.55);
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%);
  }
  .adm-btn-danger:hover {
    border-color: rgba(255,0,110,0.5);
    color: var(--cp-pink);
    background: rgba(255,0,110,0.06);
    box-shadow: 0 0 12px rgba(255,0,110,0.1);
  }

  /* ══════════════════════════════════════════
     ALERT / ERROR
  ══════════════════════════════════════════ */
  .adm-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-bottom: 20px;
    background: rgba(255,0,110,0.07);
    border: 1px solid rgba(255,0,110,0.28);
    color: #ff6ea3;
    font-size: 0.72rem;
    font-family: 'Share Tech Mono', monospace;
    letter-spacing: 0.04em;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    animation: alertIn 0.24s ease;
  }
  @keyframes alertIn { from { opacity:0; transform: translateX(-8px); } to { opacity:1; transform:none; } }

  /* ══════════════════════════════════════════
     TABLE
  ══════════════════════════════════════════ */
  .adm-table-wrap {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(0,255,225,0.2) transparent;
  }
  .adm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.72rem;
    font-family: 'Share Tech Mono', monospace;
  }
  .adm-table thead tr { border-bottom: 1px solid rgba(0,255,225,0.1); }
  .adm-table th {
    padding: 10px 14px;
    text-align: left;
    font-size: 0.56rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.35);
    font-weight: 400;
    white-space: nowrap;
  }
  .adm-table th::before { content: '# '; opacity: 0.4; }
  .adm-table td {
    padding: 10px 14px;
    color: rgba(224,248,255,0.65);
    border-bottom: 1px solid rgba(0,255,225,0.04);
    white-space: nowrap;
  }
  .adm-table tbody tr:last-child td { border-bottom: none; }
  .adm-table tbody tr:hover td {
    background: rgba(0,255,225,0.025);
    color: rgba(224,248,255,0.9);
  }
  .adm-table .adm-id-cell {
    color: rgba(0,255,225,0.6);
    font-size: 0.65rem;
    letter-spacing: 0.06em;
  }
  .adm-table-actions { display: flex; gap: 8px; align-items: center; }

  /* ══════════════════════════════════════════
     ITEM LIST (combo-pack / event / game card style)
  ══════════════════════════════════════════ */
  .adm-item-list { display: flex; flex-direction: column; gap: 8px; padding: 14px 18px; }
  .adm-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 12px 16px;
    background: rgba(0,255,225,0.025);
    border: 1px solid rgba(0,255,225,0.08);
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
    transition: border-color 0.2s, background 0.2s;
  }
  .adm-item-row:hover {
    border-color: rgba(0,255,225,0.2);
    background: rgba(0,255,225,0.04);
  }
  .adm-item-name {
    font-family: 'Orbitron', monospace;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: rgba(224,248,255,0.8);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .adm-item-meta {
    font-size: 0.6rem;
    color: rgba(0,255,225,0.35);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .adm-item-actions { display: flex; gap: 8px; flex-shrink: 0; }

  /* ══════════════════════════════════════════
     STATUS PILL
  ══════════════════════════════════════════ */
  .adm-pill {
    display: inline-block;
    padding: 2px 10px;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: 'Share Tech Mono', monospace;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  }

  /* ══════════════════════════════════════════
     EMPTY STATE
  ══════════════════════════════════════════ */
  .adm-empty {
    padding: 28px 14px;
    text-align: center;
    color: rgba(224,248,255,0.18);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .adm-empty::before { content: '[ '; }
  .adm-empty::after  { content: ' ]'; }

  /* ══════════════════════════════════════════
     FORM GRID (two-col for wider fields)
  ══════════════════════════════════════════ */
  .adm-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 18px;
  }
  @media (max-width: 640px) { .adm-form-grid { grid-template-columns: 1fr; } }
  .adm-form-full { grid-column: 1 / -1; }

  /* ══════════════════════════════════════════
     LOADING BLINK
  ══════════════════════════════════════════ */
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0.2;} }
  .adm-loading {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: rgba(0,255,225,0.35);
    letter-spacing: 0.1em;
    animation: blink 1s steps(1) infinite;
  }
`;