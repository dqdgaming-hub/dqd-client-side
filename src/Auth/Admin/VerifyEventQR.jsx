import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap');

  .vqr-wrapper {
    font-family: 'Share Tech Mono', monospace;
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }

  .vqr-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .vqr-icon {
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #ff2d78, #ffe600);
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .vqr-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #ff2d78;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    text-shadow: 0 0 16px rgba(255,45,120,0.4);
    margin: 0;
  }

  .vqr-subtitle {
    font-size: 0.62rem;
    color: #ffe600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-top: 3px;
  }

  .vqr-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .vqr-tab {
    flex: 1;
    font-family: 'Orbitron', sans-serif;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    padding: 0.7rem 1rem;
    cursor: pointer;
    border: 1px solid rgba(255,45,120,0.25);
    background: rgba(255,45,120,0.03);
    color: rgba(255,45,120,0.5);
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition: all 0.2s;
  }

  .vqr-tab.active {
    background: rgba(255,45,120,0.15);
    color: #ff2d78;
    border-color: rgba(255,45,120,0.5);
    box-shadow: 0 0 14px rgba(255,45,120,0.25);
  }

  .vqr-panel {
    background: rgba(255,45,120,0.03);
    border: 1px solid rgba(255,45,120,0.2);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    padding: 2rem;
    position: relative;
    margin-bottom: 1.5rem;
  }

  .vqr-panel::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ff2d78, transparent 70%);
  }

  .vqr-label {
    font-size: 0.68rem;
    letter-spacing: 0.2em;
    color: #ffe600;
    text-transform: uppercase;
    margin-bottom: 0.9rem;
    display: block;
  }

  .vqr-input-row {
    display: flex;
    gap: 0.75rem;
    align-items: stretch;
  }

  .vqr-input {
    flex: 1;
    background: rgba(0,0,0,0.5);
    border: 1px solid rgba(255,45,120,0.25);
    color: #e0ffe0;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.92rem;
    padding: 0.7rem 1rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
    letter-spacing: 0.08em;
  }

  .vqr-input:focus {
    border-color: #ff2d78;
    box-shadow: 0 0 14px rgba(255,45,120,0.2);
    background: rgba(255,45,120,0.04);
  }

  .vqr-input::placeholder {
    color: rgba(224,255,224,0.3);
    letter-spacing: 0.12em;
    font-size: 0.8rem;
  }

  .vqr-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0a0a1a;
    background: linear-gradient(90deg, #ff2d78, #c4004e);
    border: none;
    padding: 0 1.5rem;
    cursor: pointer;
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    transition: box-shadow 0.2s, transform 0.1s, opacity 0.15s;
    white-space: nowrap;
  }

  .vqr-btn:hover {
    box-shadow: 0 0 20px rgba(255,45,120,0.45);
    transform: translateY(-1px);
  }

  .vqr-hint {
    font-size: 0.65rem;
    color: rgba(255,45,120,0.45);
    letter-spacing: 0.12em;
    margin-top: 0.75rem;
  }

  .vqr-error {
    background: rgba(255,45,120,0.08);
    border: 1px solid rgba(255,45,120,0.4);
    color: #ff2d78;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    padding: 0.85rem 1.25rem;
    margin-bottom: 1.25rem;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
  }

  /* Scan mode */
  .vqr-scan-frame {
    position: relative;
    width: 100%;
    max-width: 360px;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
    background: #000;
    overflow: hidden;
    border: 1px solid rgba(255,45,120,0.25);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  }

  .vqr-scan-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .vqr-scan-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.9rem;
    color: rgba(255,45,120,0.4);
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-align: center;
    padding: 1.5rem;
  }

  .vqr-scan-reticle {
    position: absolute;
    top: 14%; left: 14%; right: 14%; bottom: 14%;
    pointer-events: none;
  }

  .vqr-scan-corner {
    position: absolute;
    width: 26px;
    height: 26px;
    border: 2px solid #00ffe7;
  }

  .vqr-scan-corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; }
  .vqr-scan-corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; }
  .vqr-scan-corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; }
  .vqr-scan-corner.br { bottom: 0; right: 0; border-left: none; border-top: none; }

  .vqr-scan-status {
    position: absolute;
    bottom: 10px;
    left: 0; right: 0;
    text-align: center;
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    color: #00ffe7;
    text-transform: uppercase;
  }

  .vqr-scan-live {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }

  .vqr-scan-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ff2d78;
    animation: pulse 1.2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.35; }
    50% { opacity: 1; }
  }

  .vqr-scan-controls {
    display: flex;
    justify-content: center;
    margin-top: 1.25rem;
  }

  /* Result panel */
  .vqr-result {
    background: rgba(0,255,231,0.04);
    border: 1px solid rgba(0,255,231,0.25);
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    padding: 1.75rem 2rem;
    position: relative;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .vqr-result::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #00ffe7, transparent 70%);
  }

  .vqr-result-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0,255,231,0.1);
  }

  .vqr-check {
    width: 36px;
    height: 36px;
    background: rgba(0,255,231,0.15);
    border: 1px solid rgba(0,255,231,0.4);
    clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .vqr-result-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #00ffe7;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    text-shadow: 0 0 10px rgba(0,255,231,0.4);
  }

  .vqr-result-status {
    font-size: 0.6rem;
    color: rgba(0,255,231,0.55);
    letter-spacing: 0.2em;
    margin-top: 2px;
  }

  .vqr-field {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.7rem;
  }

  .vqr-field-key {
    font-size: 0.62rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(0,255,231,0.45);
    white-space: nowrap;
    min-width: 80px;
  }

  .vqr-field-val {
    font-size: 0.88rem;
    color: #e0ffe0;
  }

  .vqr-field-val.id-val {
    color: #ffe600;
    font-size: 0.92rem;
  }

  .vqr-result-actions {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,255,231,0.1);
  }

  .vqr-next-btn {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #00ffe7;
    background: rgba(0,255,231,0.1);
    border: 1px solid rgba(0,255,231,0.3);
    padding: 0.55rem 1.2rem;
    cursor: pointer;
    clip-path: polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%);
  }

  @media (max-width: 500px) {
    .vqr-wrapper { padding: 1rem; }
    .vqr-input-row { flex-direction: column; }
    .vqr-btn { padding: 0.7rem 1.5rem; }
  }
`;

export default function VerifyEventQR() {
  const [mode, setMode] = useState("manual"); // "manual" | "scan"
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const verifyingRef = useRef(false);

  const verify = async (rawToken) => {
    const tokenToVerify = (rawToken ?? token).trim();

    if (!tokenToVerify) {
      setError("Enter or scan a QR token first.");
      return;
    }

    setError(null);
    try {
      const data = await adminApi.verifyEventQR(tokenToVerify);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || "Verification failed.");
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") verify();
  };

  const stopScanner = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const tick = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data && !verifyingRef.current) {
        verifyingRef.current = true;
        stopScanner();
        setToken(code.data);
        verify(code.data).finally(() => {
          verifyingRef.current = false;
        });
        return;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const startScanner = async () => {
    setCameraError(null);
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission denied. Allow camera access to scan."
          : "Could not access the camera on this device."
      );
    }
  };

  const switchMode = (next) => {
    if (next === mode) return;
    stopScanner();
    setError(null);
    setCameraError(null);
    setMode(next);
  };

  const scanAnother = () => {
    setResult(null);
    setError(null);
    setToken("");
    if (mode === "scan") startScanner();
  };

  useEffect(() => stopScanner, []);

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="vqr-wrapper">

        <div className="vqr-header">
          <div className="vqr-icon">⬡</div>
          <div>
            <h2 className="vqr-title">QR Verify</h2>
            <div className="vqr-subtitle">Entry Authentication System</div>
          </div>
        </div>

        <div className="vqr-tabs">
          <button
            className={`vqr-tab ${mode === "manual" ? "active" : ""}`}
            onClick={() => switchMode("manual")}
          >
            ⌨ Manual Entry
          </button>
          <button
            className={`vqr-tab ${mode === "scan" ? "active" : ""}`}
            onClick={() => switchMode("scan")}
          >
            📷 Scan QR
          </button>
        </div>

        {error && <div className="vqr-error">⚠ {error}</div>}

        {mode === "manual" ? (
          <div className="vqr-panel">
            <label className="vqr-label">▸ Enter QR Token</label>
            <div className="vqr-input-row">
              <input
                className="vqr-input"
                placeholder="Paste token…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
              />
              <button className="vqr-btn" onClick={() => verify()}>
                ▶ Verify
              </button>
            </div>
            <div className="vqr-hint">// Press Enter or click Verify to authenticate</div>
          </div>
        ) : (
          <div className="vqr-panel">
            <label className="vqr-label">▸ Point Camera at QR Code</label>

            {cameraError && <div className="vqr-error">⚠ {cameraError}</div>}

            <div className="vqr-scan-frame">
              <video
                ref={videoRef}
                className="vqr-scan-video"
                muted
                playsInline
                style={{ display: scanning ? "block" : "none" }}
              />
              {!scanning && (
                <div className="vqr-scan-placeholder">
                  <div>// CAMERA INACTIVE</div>
                  <button className="vqr-btn" onClick={startScanner}>
                    ▶ Start Camera
                  </button>
                </div>
              )}
              {scanning && (
                <>
                  <div className="vqr-scan-reticle">
                    <div className="vqr-scan-corner tl" />
                    <div className="vqr-scan-corner tr" />
                    <div className="vqr-scan-corner bl" />
                    <div className="vqr-scan-corner br" />
                  </div>
                  <div className="vqr-scan-status">
                    <span className="vqr-scan-live">
                      <span className="vqr-scan-dot" /> SCANNING…
                    </span>
                  </div>
                </>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {scanning && (
              <div className="vqr-scan-controls">
                <button className="vqr-btn" onClick={stopScanner}>
                  ■ Stop Camera
                </button>
              </div>
            )}

            <div className="vqr-hint">// Hold the QR code steady inside the frame</div>
          </div>
        )}

        {result && (
          <div className="vqr-result">
            <div className="vqr-result-header">
              <div className="vqr-check">✓</div>
              <div>
                <div className="vqr-result-title">Booking Verified</div>
                <div className="vqr-result-status">ACCESS GRANTED</div>
              </div>
            </div>
            <div className="vqr-field">
              <span className="vqr-field-key">Booking</span>
              <span className="vqr-field-val id-val">{result.booking_id}</span>
            </div>
            <div className="vqr-field">
              <span className="vqr-field-key">Name</span>
              <span className="vqr-field-val">{result.name}</span>
            </div>
            <div className="vqr-field">
              <span className="vqr-field-key">Event</span>
              <span className="vqr-field-val">{result.event}</span>
            </div>

            <div className="vqr-result-actions">
              <button className="vqr-next-btn" onClick={scanAnother}>
                ↻ Verify Another
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}