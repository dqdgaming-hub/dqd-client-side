import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";
import { bookingCss } from "./bookingTheme";

/* ─── Inline SVG Icons ────────────────────────────────────────────── */
const Icon = {
  Scan: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  Camera: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  Check: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Key: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  Hash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  ),
  Box: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/* ─── CSS ─────────────────────────────────────────────────────────── */
const SCAN_CSS = `
  /* ── layout ── */
  .vq-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .vq-grid { grid-template-columns: 1fr; }
  }

  /* ── hero ── */
  .vq-hero {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .vq-hero-left { display: flex; align-items: flex-start; gap: 16px; }
  .vq-hero-icon {
    width: 48px; height: 48px; flex-shrink: 0;
    border: 1px solid rgba(0,255,225,0.25);
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    display: flex; align-items: center; justify-content: center;
    color: var(--bk-cyan);
    background: rgba(0,255,225,0.05);
  }
  .vq-kicker {
    font-family: var(--bk-font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(0,255,225,0.5);
    margin: 0 0 5px;
  }
  .vq-h1 {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.45rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--bk-text);
    margin: 0 0 4px;
    line-height: 1.15;
  }
  .vq-h1 span { color: var(--bk-cyan); }
  .vq-hero-sub {
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    color: var(--bk-muted);
    margin: 0;
    letter-spacing: 0.06em;
  }

  /* ── scan-again btn ── */
  .vq-btn-ghost {
    font-family: var(--bk-font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--bk-cyan);
    border: 1px solid rgba(0,255,225,0.3);
    background: rgba(0,255,225,0.04);
    padding: 8px 14px;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s, border-color 0.2s;
    white-space: nowrap;
    align-self: flex-start;
    margin-top: 4px;
  }
  .vq-btn-ghost:hover {
    background: rgba(0,255,225,0.09);
    border-color: rgba(0,255,225,0.55);
  }

  /* ── qr-reader reset ── */
  #qr-reader { background: transparent !important; border: none !important; }
  #qr-reader > div { border: none !important; }
  #qr-reader__header_message { display: none !important; }
  #qr-reader__status_span {
    font-family: 'Share Tech Mono', monospace !important;
    font-size: 0.58rem !important;
    color: rgba(0,255,225,0.55) !important;
    letter-spacing: 0.07em !important;
  }
  #qr-reader__scan_region {
    background: var(--bk-bg) !important;
    min-height: 260px;
  }
  #qr-reader__dashboard_section_csr button,
  #qr-reader__dashboard_section_swaplink,
  #html5-qrcode-button-camera-permission,
  #html5-qrcode-button-camera-start,
  #html5-qrcode-button-camera-stop {
    padding: 7px 14px !important;
    font-family: 'Share Tech Mono', monospace !important;
    font-size: 0.58rem !important;
    letter-spacing: 0.1em !important;
    text-transform: uppercase !important;
    background: rgba(0,255,225,0.05) !important;
    border: 1px solid rgba(0,255,225,0.28) !important;
    color: var(--bk-cyan) !important;
    cursor: pointer !important;
    border-radius: 0 !important;
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  }

  /* ── scanner wrapper ── */
  .vq-scanner-wrap {
    position: relative;
    overflow: hidden;
    background: var(--bk-bg);
    border: 1px solid rgba(0,255,225,0.12);
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  }
  /* corner brackets — pure CSS */
  .vq-scanner-wrap::before,
  .vq-scanner-wrap::after {
    content: '';
    position: absolute;
    width: 22px; height: 22px;
    border-color: var(--bk-cyan);
    border-style: solid;
    z-index: 10;
    opacity: 0.7;
  }
  .vq-scanner-wrap::before { top: 10px; left: 10px; border-width: 2px 0 0 2px; }
  .vq-scanner-wrap::after  { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; }

  /* corner brackets for the remaining two corners via children */
  .vq-corner-tr, .vq-corner-bl {
    position: absolute;
    width: 22px; height: 22px;
    border-color: var(--bk-cyan);
    border-style: solid;
    z-index: 10;
    opacity: 0.7;
  }
  .vq-corner-tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; }
  .vq-corner-bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; }

  /* sweep line */
  .vq-sweep {
    position: absolute; left: 0; right: 0;
    height: 1px; top: 50%;
    background: linear-gradient(90deg, transparent 0%, var(--bk-cyan) 40%, var(--bk-cyan) 60%, transparent 100%);
    opacity: 0.55;
    animation: vq-sweep 2.4s ease-in-out infinite;
    z-index: 8;
    pointer-events: none;
  }
  @keyframes vq-sweep {
    0%   { transform: translateY(-120px); opacity: 0; }
    15%  { opacity: 0.55; }
    85%  { opacity: 0.55; }
    100% { transform: translateY(120px); opacity: 0; }
  }

  /* ── panel header decoration ── */
  .vq-live-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--bk-cyan);
    animation: vq-blink 1.4s step-end infinite;
    margin-right: 5px;
  }
  @keyframes vq-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.15; }
  }
  .vq-live-label {
    font-family: var(--bk-font-mono);
    font-size: 0.5rem;
    letter-spacing: 0.14em;
    color: var(--bk-cyan);
    text-transform: uppercase;
    display: flex; align-items: center;
  }

  /* ── stopped camera placeholder ── */
  .vq-stopped {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    min-height: 240px;
    color: var(--bk-muted);
  }
  .vq-stopped-icon {
    width: 56px; height: 56px;
    border: 1px solid rgba(0,255,225,0.18);
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    display: flex; align-items: center; justify-content: center;
    color: rgba(0,255,225,0.3);
  }
  .vq-stopped-label {
    font-family: var(--bk-font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    color: var(--bk-muted);
    text-transform: uppercase;
  }

  /* ── result panel ── */
  .vq-result-approved { border-color: rgba(0,255,100,0.3) !important; }
  .vq-result-denied   { border-color: rgba(255,79,163,0.4) !important; }

  .vq-result-icon-wrap {
    width: 64px; height: 64px; margin: 0 auto 16px;
    clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
    display: flex; align-items: center; justify-content: center;
  }
  .vq-result-icon-wrap.approved {
    background: rgba(0,255,100,0.08);
    border: 1px solid rgba(0,255,100,0.3);
    color: #00ff64;
    animation: vq-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .vq-result-icon-wrap.denied {
    background: rgba(255,79,163,0.08);
    border: 1px solid rgba(255,79,163,0.3);
    color: var(--bk-pink);
    animation: vq-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  @keyframes vq-pop {
    from { transform: scale(0.6); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .vq-result-name {
    font-family: 'Orbitron', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--bk-text);
    text-align: center;
    letter-spacing: 0.04em;
    margin-bottom: 16px;
  }
  .vq-result-grid {
    display: grid;
    gap: 10px;
    text-align: left;
  }
  .vq-result-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 10px;
    background: rgba(255,255,255,0.025);
    border: 1px solid rgba(255,255,255,0.05);
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  }
  .vq-result-label {
    font-family: var(--bk-font-mono);
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--bk-muted);
    display: flex;
    align-items: center;
    gap: 5px;
    flex-shrink: 0;
  }
  .vq-result-val {
    font-family: var(--bk-font-mono);
    font-size: 0.65rem;
    color: var(--bk-text);
    text-align: right;
    word-break: break-all;
  }
  .vq-checkin-chip {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--bk-font-mono);
    font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: #00ff64;
    padding: 3px 8px;
    border: 1px solid rgba(0,255,100,0.3);
    background: rgba(0,255,100,0.06);
    clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px));
  }
  .vq-fail-msg {
    font-family: var(--bk-font-mono);
    font-size: 0.68rem;
    color: var(--bk-pink);
    text-align: center;
    letter-spacing: 0.04em;
    line-height: 1.7;
    margin: 0;
    padding: 0 8px;
  }

  /* ── manual entry panel ── */
  .vq-input-icon-wrap {
    position: relative;
  }
  .vq-input-icon {
    position: absolute;
    left: 12px; top: 50%; transform: translateY(-50%);
    color: rgba(0,255,225,0.4);
    pointer-events: none;
    display: flex; align-items: center;
  }
  .vq-input-padded {
    padding-left: 36px !important;
  }

  /* ── verify btn ── */
  .vq-btn-primary {
    font-family: var(--bk-font-mono);
    font-size: 0.6rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--bk-bg);
    background: var(--bk-cyan);
    border: none;
    padding: 10px 20px;
    clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px));
    cursor: pointer;
    transition: opacity 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .vq-btn-primary:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
  .vq-btn-primary:not(:disabled):hover { opacity: 0.82; }

  /* ── restart btn ── */
  .vq-btn-restart {
    font-family: var(--bk-font-mono);
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--bk-cyan);
    background: rgba(0,255,225,0.05);
    border: 1px solid rgba(0,255,225,0.25);
    padding: 8px 14px;
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    cursor: pointer;
    display: inline-flex; align-items: center; gap: 6px;
    transition: background 0.2s;
  }
  .vq-btn-restart:hover { background: rgba(0,255,225,0.1); }

  /* ── how-to steps ── */
  .vq-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .vq-step:last-child { border-bottom: none; }
  .vq-step-num {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.5rem;
    color: var(--bk-cyan);
    opacity: 0.6;
    width: 18px;
    flex-shrink: 0;
    padding-top: 1px;
  }
  .vq-step-text {
    font-family: var(--bk-font-mono);
    font-size: 0.58rem;
    color: var(--bk-muted);
    letter-spacing: 0.04em;
    line-height: 1.6;
  }

  /* ── divider ── */
  .vq-divider {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin: 18px 0;
  }

  /* ── section label ── */
  .vq-section-label {
    font-family: var(--bk-font-mono);
    font-size: 0.5rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--bk-cyan);
    opacity: 0.6;
    margin: 0 0 10px;
  }

  /* ── verifying spinner ── */
  @keyframes vq-spin {
    to { transform: rotate(360deg); }
  }
  .vq-spinner {
    display: inline-block;
    width: 12px; height: 12px;
    border: 1.5px solid rgba(0,0,0,0.25);
    border-top-color: var(--bk-bg);
    border-radius: 50%;
    animation: vq-spin 0.7s linear infinite;
    flex-shrink: 0;
  }
`;

/* ─── Component ───────────────────────────────────────────────────── */
export default function VerifyBookingQR() {
  const scannerRef = useRef(null);
  const [token,     setToken]   = useState("");
  const [result,    setResult]  = useState(null);
  const [verifying, setVer]     = useState(false);
  const [scanMode,  setScanMode] = useState(true);

  useEffect(() => {
    if (!scanMode) return;
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 240 },
      false
    );
    scanner.render(
      (decodedText) => {
        setToken(decodedText);
        verifyToken(decodedText);
        scanner.clear().catch(() => {});
        setScanMode(false);
      },
      () => {}
    );
    scannerRef.current = scanner;
    return () => { scannerRef.current?.clear()?.catch(() => {}); };
  }, [scanMode]);

  async function verifyToken(qrToken = token) {
    if (!qrToken.trim()) return;
    setVer(true);
    try {
      const data = await adminApi.verifyBookingQR(qrToken.trim());
      setResult({ ...data, success: true });
    } catch (err) {
      setResult({
        success: false, valid: false,
        message: err.message || "Verification failed",
      });
    } finally {
      setVer(false);
    }
  }

  function reset() {
    setResult(null);
    setToken("");
    setScanMode(true);
  }

  return (
    <>
      <style>{bookingCss}</style>
      <style>{SCAN_CSS}</style>

      <div className="bk-pg">
        <AdminLayout>

          {/* ── Hero ── */}
          <header className="vq-hero">
            <div className="vq-hero-left">
              <div className="vq-hero-icon">
                <Icon.Scan />
              </div>
              <div>
                <p className="vq-kicker">Bookings · Entry Verification</p>
                <h1 className="vq-h1">Verify <span>QR Entry</span></h1>
                <p className="vq-hero-sub">Scan or enter token to authenticate customer access</p>
              </div>
            </div>
            {result && (
              <button className="vq-btn-ghost" onClick={reset}>
                <Icon.Refresh /> Scan Again
              </button>
            )}
          </header>

          {/* ── Main Grid ── */}
          <div className="vq-grid">

            {/* ── Left: Scanner or Result ── */}
            {!result ? (
              <div className="bk-panel">
                <div className="bk-panel-head">
                  <h2 className="bk-panel-title">Camera Scanner</h2>
                  {scanMode ? (
                    <span className="vq-live-label">
                      <span className="vq-live-dot" /> Live
                    </span>
                  ) : (
                    <span className="vq-live-label" style={{ color: "var(--bk-muted)", opacity: 0.5 }}>
                      Stopped
                    </span>
                  )}
                </div>

                <div className="bk-panel-body" style={{ padding: 0 }}>
                  {scanMode ? (
                    <div className="vq-scanner-wrap">
                      <div className="vq-corner-tr" />
                      <div className="vq-corner-bl" />
                      <div className="vq-sweep" />
                      <div id="qr-reader" style={{ width: "100%" }} />
                    </div>
                  ) : (
                    <div className="vq-stopped">
                      <div className="vq-stopped-icon">
                        <Icon.Camera />
                      </div>
                      <span className="vq-stopped-label">Camera offline</span>
                      <button
                        className="vq-btn-restart"
                        onClick={() => { setScanMode(true); setToken(""); }}
                      >
                        <Icon.Refresh /> Restart Scanner
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Result ── */
              <div
                className={`bk-panel ${result.valid ? "vq-result-approved" : "vq-result-denied"}`}
              >
                <div className="bk-panel-head">
                  <h2
                    className="bk-panel-title"
                    style={{ color: result.valid ? "#00ff64" : "var(--bk-pink)" }}
                  >
                    {result.valid ? "Entry Approved" : "Access Denied"}
                  </h2>
                </div>

                <div className="bk-panel-body" style={{ textAlign: "center" }}>
                  <div className={`vq-result-icon-wrap ${result.valid ? "approved" : "denied"}`}>
                    {result.valid ? <Icon.Check /> : <Icon.X />}
                  </div>

                  {result.valid ? (
                    <>
                      <div className="vq-result-name">{result.customer}</div>
                      <div className="vq-result-grid">
                        <div className="vq-result-row">
                          <span className="vq-result-label"><Icon.Hash /> Booking ID</span>
                          <span className="vq-result-val"
                            style={{ fontFamily: "var(--bk-font-mono)", fontSize: "0.68rem", color: "var(--bk-cyan)" }}
                          >
                            {result.booking_id}
                          </span>
                        </div>
                        <div className="vq-result-row">
                          <span className="vq-result-label"><Icon.Box /> Item</span>
                          <span className="vq-result-val">{result.item}</span>
                        </div>
                        <div className="vq-result-row">
                          <span className="vq-result-label"><Icon.Shield /> Status</span>
                          <span className="vq-checkin-chip">
                            <Icon.Check /> Checked In
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="vq-fail-msg">{result.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Right: Manual Entry ── */}
            <div className="bk-panel">
              <div className="bk-panel-head">
                <h2 className="bk-panel-title">Manual Token Entry</h2>
              </div>

              <div className="bk-panel-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="bk-form-field">
                    <label className="bk-label">QR Token</label>
                    <div className="vq-input-icon-wrap">
                      <span className="vq-input-icon"><Icon.Key /></span>
                      <input
                        className="bk-input vq-input-padded"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste or type token…"
                        onKeyDown={(e) => e.key === "Enter" && verifyToken()}
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <button
                    className="vq-btn-primary"
                    onClick={() => verifyToken()}
                    disabled={verifying || !token.trim()}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {verifying
                      ? <><span className="vq-spinner" /> Verifying</>
                      : <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                          Verify Token
                        </>
                    }
                  </button>
                </div>

                <hr className="vq-divider" />

                <p className="vq-section-label">
                  <Icon.Info style={{ display: "inline", marginRight: 5, verticalAlign: "middle" }} />
                  How to use
                </p>

                {[
                  "Point camera at customer's QR code",
                  "Auto-verifies on detection — no tap needed",
                  "Or paste the token manually above",
                  "Each QR is single-use and expires after check-in",
                ].map((text, i) => (
                  <div className="vq-step" key={i}>
                    <span className="vq-step-num">0{i + 1}</span>
                    <span className="vq-step-text">{text}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </AdminLayout>
      </div>
    </>
  );
}