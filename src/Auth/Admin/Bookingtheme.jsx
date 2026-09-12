// bookingTheme.js — shared design tokens for the bookings module

export const bookingCss = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap');

  /* ── Tokens ── */
  :root {
    --bk-cyan:    #00ffe1;
    --bk-pink:    #ff4fa3;
    --bk-yellow:  #ffe600;
    --bk-purple:  #a855f7;
    --bk-bg:      #080c14;
    --bk-surface: #0d1420;
    --bk-border:  rgba(0,255,225,0.12);
    --bk-text:    #e0f8ff;
    --bk-muted:   rgba(224,248,255,0.45);
    --bk-font-display: 'Orbitron', sans-serif;
    --bk-font-mono:    'Share Tech Mono', monospace;
    --bk-font-body:    'Inter', sans-serif;
  }

  /* ── Page wrapper ── */
  .bk-pg {
    min-height: 100vh;
    background: var(--bk-bg);
    color: var(--bk-text);
    font-family: var(--bk-font-body);
  }

  /* ── Hero ── */
  .bk-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    padding: 32px 0 28px;
    border-bottom: 1px solid var(--bk-border);
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .bk-kicker {
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.18em;
    color: var(--bk-cyan);
    text-transform: uppercase;
    margin: 0 0 6px;
  }
  .bk-h1 {
    font-family: var(--bk-font-display);
    font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 700;
    margin: 0 0 6px;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
  .bk-h1 span { color: var(--bk-cyan); }
  .bk-hero-sub {
    font-size: 0.78rem;
    color: var(--bk-muted);
    margin: 0;
  }
  .bk-hero-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

  /* ── Stats row ── */
  .bk-stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }
  .bk-stat {
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    padding: 14px 16px;
  }
  .bk-stat-val {
    font-family: var(--bk-font-display);
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1;
  }
  .bk-stat-label {
    font-family: var(--bk-font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    color: var(--bk-muted);
    text-transform: uppercase;
    margin-top: 4px;
  }
  .bk-stat.cyan .bk-stat-val { color: var(--bk-cyan); }
  .bk-stat.pink .bk-stat-val { color: var(--bk-pink); }
  .bk-stat.yellow .bk-stat-val { color: var(--bk-yellow); }
  .bk-stat.purple .bk-stat-val { color: var(--bk-purple); }

  /* ── Segment nav (tabs) ── */
  .bk-seg {
    display: flex;
    gap: 4px;
    background: rgba(0,0,0,0.4);
    border: 1px solid var(--bk-border);
    padding: 4px;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    margin-bottom: 24px;
    flex-wrap: wrap;
  }
  .bk-seg-btn {
    flex: 1;
    min-width: 100px;
    padding: 8px 16px;
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    background: transparent;
    border: none;
    color: var(--bk-muted);
    cursor: pointer;
    transition: all 0.15s;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    position: relative;
    white-space: nowrap;
  }
  .bk-seg-btn:hover { color: var(--bk-text); background: rgba(0,255,225,0.05); }
  .bk-seg-btn.active {
    background: rgba(0,255,225,0.1);
    color: var(--bk-cyan);
    box-shadow: 0 0 12px rgba(0,255,225,0.15) inset;
  }
  .bk-seg-btn .bk-seg-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px; height: 18px;
    background: rgba(0,255,225,0.15);
    border-radius: 2px;
    font-size: 0.55rem;
    margin-left: 6px;
    color: var(--bk-cyan);
  }
  .bk-seg-btn.pink.active { background: rgba(255,79,163,0.1); color: var(--bk-pink); box-shadow: 0 0 12px rgba(255,79,163,0.15) inset; }
  .bk-seg-btn.pink .bk-seg-count { background: rgba(255,79,163,0.15); color: var(--bk-pink); }
  .bk-seg-btn.yellow.active { background: rgba(255,230,0,0.08); color: var(--bk-yellow); box-shadow: 0 0 12px rgba(255,230,0,0.12) inset; }
  .bk-seg-btn.yellow .bk-seg-count { background: rgba(255,230,0,0.15); color: var(--bk-yellow); }

  /* ── Toolbar (search + filter row) ── */
  .bk-toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .bk-search-wrap { position: relative; flex: 1; min-width: 180px; }
  .bk-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; color: var(--bk-muted); pointer-events: none; }
  .bk-search {
    width: 100%;
    padding: 9px 12px 9px 32px;
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    color: var(--bk-text);
    font-family: var(--bk-font-mono);
    font-size: 0.7rem;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    outline: none;
    transition: border-color 0.15s;
  }
  .bk-search:focus { border-color: rgba(0,255,225,0.4); }
  .bk-search::placeholder { color: var(--bk-muted); }
  .bk-filter-select {
    padding: 9px 12px;
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    color: var(--bk-text);
    font-family: var(--bk-font-mono);
    font-size: 0.65rem;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    outline: none;
    cursor: pointer;
    min-width: 120px;
  }
  .bk-filter-select option { background: #0d1420; }

  /* ── Table ── */
  .bk-table-wrap {
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    overflow-x: auto;
  }
  .bk-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.78rem;
  }
  .bk-table thead tr {
    border-bottom: 1px solid var(--bk-border);
    background: rgba(0,255,225,0.03);
  }
  .bk-table th {
    padding: 12px 14px;
    font-family: var(--bk-font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--bk-cyan);
    white-space: nowrap;
    text-align: left;
    font-weight: 400;
  }
  .bk-table td {
    padding: 12px 14px;
    border-bottom: 1px solid rgba(0,255,225,0.05);
    color: var(--bk-text);
    vertical-align: middle;
    white-space: nowrap;
  }
  .bk-table tbody tr {
    transition: background 0.12s;
    cursor: pointer;
  }
  .bk-table tbody tr:hover { background: rgba(0,255,225,0.03); }
  .bk-table tbody tr:last-child td { border-bottom: none; }

  /* ── Booking ID chip ── */
  .bk-id {
    font-family: var(--bk-font-mono);
    font-size: 0.62rem;
    color: var(--bk-cyan);
    letter-spacing: 0.06em;
  }

  /* ── Status badges ── */
  .bk-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    font-family: var(--bk-font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
    white-space: nowrap;
  }
  .bk-badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
  .bk-badge.confirmed  { background: rgba(0,255,100,0.1);  color: #00ff64; border: 1px solid rgba(0,255,100,0.25); }
  .bk-badge.confirmed::before  { background: #00ff64; box-shadow: 0 0 4px #00ff64; }
  .bk-badge.pending    { background: rgba(255,230,0,0.1);  color: var(--bk-yellow); border: 1px solid rgba(255,230,0,0.25); }
  .bk-badge.pending::before    { background: var(--bk-yellow); box-shadow: 0 0 4px var(--bk-yellow); }
  .bk-badge.cancelled  { background: rgba(255,79,163,0.1); color: var(--bk-pink); border: 1px solid rgba(255,79,163,0.25); }
  .bk-badge.cancelled::before  { background: var(--bk-pink); box-shadow: 0 0 4px var(--bk-pink); }
  .bk-badge.completed  { background: rgba(0,255,225,0.1);  color: var(--bk-cyan); border: 1px solid rgba(0,255,225,0.25); }
  .bk-badge.completed::before  { background: var(--bk-cyan); box-shadow: 0 0 4px var(--bk-cyan); }
  .bk-badge.paid       { background: rgba(0,255,100,0.1);  color: #00ff64; border: 1px solid rgba(0,255,100,0.25); }
  .bk-badge.paid::before       { background: #00ff64; box-shadow: 0 0 4px #00ff64; }
  .bk-badge.refunded   { background: rgba(168,85,247,0.1); color: var(--bk-purple); border: 1px solid rgba(168,85,247,0.25); }
  .bk-badge.refunded::before   { background: var(--bk-purple); }
  .bk-badge.approved   { background: rgba(0,255,100,0.1);  color: #00ff64; border: 1px solid rgba(0,255,100,0.25); }
  .bk-badge.approved::before   { background: #00ff64; }
  .bk-badge.rejected   { background: rgba(255,79,163,0.1); color: var(--bk-pink); border: 1px solid rgba(255,79,163,0.25); }
  .bk-badge.rejected::before   { background: var(--bk-pink); }
  .bk-badge.attended   { background: rgba(0,255,225,0.1);  color: var(--bk-cyan); border: 1px solid rgba(0,255,225,0.25); }
  .bk-badge.attended::before   { background: var(--bk-cyan); }

  /* ── Type chip ── */
  .bk-type-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-family: var(--bk-font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-radius: 2px;
  }
  .bk-type-chip.game  { background: rgba(0,255,225,0.08); color: var(--bk-cyan);   border: 1px solid rgba(0,255,225,0.2); }
  .bk-type-chip.combo { background: rgba(255,230,0,0.08);  color: var(--bk-yellow); border: 1px solid rgba(255,230,0,0.2); }
  .bk-type-chip.event { background: rgba(168,85,247,0.08); color: var(--bk-purple); border: 1px solid rgba(168,85,247,0.2); }

  /* ── Happy hour indicator ── */
  .bk-happy { font-size: 0.7rem; display: flex; align-items: center; gap: 4px; }
  .bk-happy.yes { color: var(--bk-yellow); }
  .bk-happy.no  { color: var(--bk-muted); }

  /* ── Buttons ── */
  .bk-btn-primary {
    position: relative; overflow: hidden;
    padding: 10px 20px;
    background: transparent;
    border: 1px solid rgba(0,255,225,0.4);
    color: var(--bk-cyan);
    font-family: var(--bk-font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: all 0.15s;
    white-space: nowrap;
  }
  .bk-btn-primary::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(0,255,225,0.06);
    opacity: 0; transition: opacity 0.15s;
  }
  .bk-btn-primary:hover::before { opacity: 1; }
  .bk-btn-primary:hover { border-color: rgba(0,255,225,0.7); box-shadow: 0 0 16px rgba(0,255,225,0.15); }

  .bk-btn-success {
    position: relative; overflow: hidden;
    padding: 10px 20px;
    background: rgba(0,255,100,0.08);
    border: 1px solid rgba(0,255,100,0.35);
    color: #00ff64;
    font-family: var(--bk-font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: all 0.15s;
    white-space: nowrap;
  }
  .bk-btn-success:hover { background: rgba(0,255,100,0.14); border-color: rgba(0,255,100,0.6); box-shadow: 0 0 14px rgba(0,255,100,0.15); }

  .bk-btn-danger {
    position: relative; overflow: hidden;
    padding: 10px 20px;
    background: rgba(255,79,163,0.08);
    border: 1px solid rgba(255,79,163,0.35);
    color: var(--bk-pink);
    font-family: var(--bk-font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: all 0.15s;
    white-space: nowrap;
  }
  .bk-btn-danger:hover { background: rgba(255,79,163,0.14); border-color: rgba(255,79,163,0.6); box-shadow: 0 0 14px rgba(255,79,163,0.15); }

  .bk-btn-ghost {
    padding: 10px 20px;
    background: transparent;
    border: 1px solid var(--bk-border);
    color: var(--bk-muted);
    font-family: var(--bk-font-mono);
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    transition: all 0.15s;
    white-space: nowrap;
  }
  .bk-btn-ghost:hover { border-color: rgba(0,255,225,0.3); color: var(--bk-text); }

  .bk-btn-sm {
    padding: 5px 12px !important;
    font-size: 0.55rem !important;
  }

  /* ── Inline row actions ── */
  .bk-row-actions { display: flex; gap: 6px; align-items: center; }

  /* ── Empty state ── */
  .bk-empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--bk-muted);
  }
  .bk-empty-icon { font-size: 2.5rem; margin-bottom: 12px; }
  .bk-empty-msg { font-family: var(--bk-font-mono); font-size: 0.7rem; letter-spacing: 0.1em; }

  /* ── Loading skeleton ── */
  .bk-skeleton { animation: bk-pulse 1.6s ease-in-out infinite; }
  @keyframes bk-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  .bk-skel-row { height: 44px; background: rgba(0,255,225,0.04); border-bottom: 1px solid rgba(0,255,225,0.05); }

  /* ── Alert ── */
  .bk-alert {
    padding: 12px 16px;
    background: rgba(255,79,163,0.08);
    border: 1px solid rgba(255,79,163,0.3);
    color: var(--bk-pink);
    font-family: var(--bk-font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.06em;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    margin-bottom: 20px;
  }

  /* ── Panel ── */
  .bk-panel {
    background: var(--bk-surface);
    border: 1px solid var(--bk-border);
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    margin-bottom: 20px;
  }
  .bk-panel-head {
    padding: 14px 20px;
    border-bottom: 1px solid var(--bk-border);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .bk-panel-title {
    font-family: var(--bk-font-display);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--bk-cyan);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;
  }
  .bk-panel-body { padding: 20px; }

  /* ── Detail grid ── */
  .bk-detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .bk-field { display: flex; flex-direction: column; gap: 4px; }
  .bk-field-label {
    font-family: var(--bk-font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--bk-muted);
  }
  .bk-field-val {
    font-size: 0.82rem;
    color: var(--bk-text);
    font-weight: 500;
  }
  .bk-field-val.mono { font-family: var(--bk-font-mono); font-size: 0.72rem; }
  .bk-field-val.highlight { color: var(--bk-cyan); font-family: var(--bk-font-display); font-size: 0.9rem; }

  /* ── Form fields ── */
  .bk-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 640px) { .bk-form-grid { grid-template-columns: 1fr; } }
  .bk-form-full { grid-column: 1 / -1; }
  .bk-form-field { display: flex; flex-direction: column; gap: 6px; }
  .bk-label {
    font-family: var(--bk-font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--bk-muted);
  }
  .bk-input, .bk-select, .bk-textarea {
    padding: 10px 12px;
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--bk-border);
    color: var(--bk-text);
    font-family: var(--bk-font-mono);
    font-size: 0.72rem;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
  }
  .bk-input:focus, .bk-select:focus, .bk-textarea:focus { border-color: rgba(0,255,225,0.4); }
  .bk-input::placeholder, .bk-textarea::placeholder { color: var(--bk-muted); }
  .bk-select option { background: #0d1420; }
  .bk-textarea { min-height: 80px; resize: vertical; }

  /* ── QR display ── */
  .bk-qr-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px;
  }
  .bk-qr-img {
    border: 2px solid rgba(0,255,225,0.3);
    padding: 8px;
    background: white;
  }
  .bk-qr-token {
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    color: var(--bk-muted);
    word-break: break-all;
    text-align: center;
  }
  .bk-checkin-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px;
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .bk-checkin-badge.done   { background: rgba(0,255,100,0.1); border: 1px solid rgba(0,255,100,0.3); color: #00ff64; clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px)); }
  .bk-checkin-badge.waiting{ background: rgba(255,230,0,0.08); border: 1px solid rgba(255,230,0,0.3); color: var(--bk-yellow); clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px)); }

  /* ── Members table ── */
  .bk-members-table { width: 100%; border-collapse: collapse; font-size: 0.75rem; }
  .bk-members-table th {
    padding: 8px 12px;
    font-family: var(--bk-font-mono);
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--bk-muted);
    border-bottom: 1px solid var(--bk-border);
    text-align: left;
  }
  .bk-members-table td { padding: 8px 12px; border-bottom: 1px solid rgba(0,255,225,0.04); }
  .bk-members-table .bk-admin-tag {
    font-family: var(--bk-font-mono);
    font-size: 0.5rem;
    padding: 2px 6px;
    background: rgba(0,255,225,0.08);
    color: var(--bk-cyan);
    border: 1px solid rgba(0,255,225,0.2);
    margin-left: 6px;
  }

  /* ── QR scanner ── */
  .bk-scanner-wrap { position: relative; }
  #qr-reader { border-radius: 0 !important; overflow: hidden; }
  #qr-reader video { width: 100% !important; height: auto !important; }
  #qr-reader__scan_region { background: transparent !important; }

  /* ── Verify result ── */
  .bk-verify-result {
    padding: 28px;
    text-align: center;
  }
  .bk-verify-result.success { border-color: rgba(0,255,100,0.3); }
  .bk-verify-result.fail    { border-color: rgba(255,79,163,0.3); }
  .bk-verify-icon { font-size: 2.5rem; margin-bottom: 12px; }
  .bk-verify-name { font-family: var(--bk-font-display); font-size: 1.2rem; font-weight: 700; margin-bottom: 6px; color: #00ff64; }
  .bk-verify-fail-msg { font-family: var(--bk-font-mono); font-size: 0.7rem; color: var(--bk-pink); letter-spacing: 0.08em; }

  /* ── Divider ── */
  .bk-divider { border: none; border-top: 1px solid var(--bk-border); margin: 20px 0; }

  /* ── Pagination ── */
  .bk-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px;
    border-top: 1px solid var(--bk-border);
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    color: var(--bk-muted);
  }
  .bk-page-btns { display: flex; gap: 4px; }
  .bk-page-btn {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: 1px solid var(--bk-border);
    color: var(--bk-muted);
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px));
    transition: all 0.12s;
  }
  .bk-page-btn:hover, .bk-page-btn.active { border-color: rgba(0,255,225,0.4); color: var(--bk-cyan); background: rgba(0,255,225,0.05); }

  /* ── Member add row ── */
  .bk-member-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: end; margin-bottom: 8px; }
  @media (max-width: 640px) { .bk-member-row { grid-template-columns: 1fr; } }

  /* ── Toggle checkbox ── */
  .bk-toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .bk-toggle-input { width: 36px; height: 20px; appearance: none; background: rgba(0,255,225,0.08); border: 1px solid var(--bk-border); border-radius: 10px; position: relative; cursor: pointer; transition: all 0.15s; }
  .bk-toggle-input:checked { background: rgba(0,255,225,0.2); border-color: rgba(0,255,225,0.5); }
  .bk-toggle-input::after { content: ''; position: absolute; width: 14px; height: 14px; background: var(--bk-muted); border-radius: 50%; top: 2px; left: 2px; transition: all 0.15s; }
  .bk-toggle-input:checked::after { left: 18px; background: var(--bk-cyan); }
  .bk-toggle-label { font-family: var(--bk-font-mono); font-size: 0.62rem; letter-spacing: 0.06em; color: var(--bk-muted); }

  /* ── Amount display ── */
  .bk-amount { font-family: var(--bk-font-display); font-size: 0.9rem; font-weight: 600; }
  .bk-amount.pos { color: var(--bk-cyan); }
  .bk-amount.neg { color: var(--bk-pink); }

  /* ── Loyalty points ── */
  .bk-pts {
    display: inline-flex; align-items: center; gap: 4px;
    font-family: var(--bk-font-mono); font-size: 0.7rem;
    color: var(--bk-yellow);
  }

  /* ── Section title ── */
  .bk-sec-title {
    font-family: var(--bk-font-display);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--bk-cyan);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0,255,225,0.1);
  }
`;

export function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  return <span className={`bk-badge ${s}`}>{status || "—"}</span>;
}

export function TypeChip({ type }) {
  const cls = type === "combo" ? "combo" : type === "event" ? "event" : "game";
  const label = type === "combo" ? "Combo" : type === "event" ? "Event" : "Game";
  return <span className={`bk-type-chip ${cls}`}>{label}</span>;
}

export function HappyHourCell({ val }) {
  return val
    ? <span className="bk-happy yes">⚡ Happy Hr</span>
    : <span className="bk-happy no">—</span>;
}

export function SkeletonRows({ count = 5, cols = 8 }) {
  return (
    <>{Array.from({ length: count }).map((_, i) => (
      <tr key={i} className="bk-skeleton">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j}><div className="bk-skel-row" style={{ height: 14, background: "rgba(0,255,225,0.05)", borderRadius: 2 }} /></td>
        ))}
      </tr>
    ))}</>
  );
}

export function EmptyState({ icon = "📋", msg = "No bookings found" }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="bk-empty">
          <div className="bk-empty-icon">{icon}</div>
          <div className="bk-empty-msg">{msg}</div>
        </div>
      </td>
    </tr>
  );
}