import { useEffect, useState } from "react";
import { onWhatsApp } from "../utils/whatsapp";

const css = `
.wa-prompt {
  position: fixed; right: 16px; bottom: 16px; z-index: 10000;
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100vh - 32px); display: flex; flex-direction: column; box-sizing: border-box;
  background: #0f1720; color: #e8eef5;
  border: 1px solid rgba(37, 211, 102, 0.45); border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0,0,0,.5);
  padding: 16px; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  animation: wa-in .2s ease-out;
}
@keyframes wa-in { from { transform: translateY(12px); opacity: 0 } to { transform: none; opacity: 1 } }
.wa-prompt h4 { margin: 0 0 4px; font-size: 15px; }
.wa-prompt p { margin: 0 0 12px; font-size: 13px; color: #9fb0c2; line-height: 1.4; }
.wa-preview {
  flex: 1 1 auto; min-height: 0; max-height: 46vh; overflow: auto; margin: 0 0 12px;
  background: #0b1a12; border: 1px solid #1d3a2a; border-radius: 10px; padding: 10px 12px;
  font: 12.5px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #d9f5e3;
  white-space: pre-wrap; word-break: break-word;
}
.wa-row { display: flex; gap: 8px; }
@media (max-width: 480px) { .wa-prompt { right: 8px; left: 8px; bottom: 8px; width: auto; } }
.wa-send {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: #25d366; color: #062b14; font-weight: 700; font-size: 14px;
  border-radius: 8px; padding: 10px 12px; text-decoration: none;
}
.wa-send:hover { background: #1fb957; }
.wa-close {
  background: transparent; color: #9fb0c2; border: 1px solid #2a3846;
  border-radius: 8px; padding: 10px 12px; cursor: pointer; font-size: 14px;
}
`;

function messageText(url) {
  try {
    return new URL(url).searchParams.get("text") || "";
  } catch {
    return "";
  }
}

export default function WhatsAppPrompt() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => onWhatsApp(setPrompt), []);

  if (!prompt) return null;

  return (
    <>
      <style>{css}</style>
      <div className="wa-prompt" role="dialog" aria-live="polite" aria-label={prompt.title}>
        <h4>{prompt.title}</h4>
        <p>Check the message, then tap Send — WhatsApp opens with it ready.</p>
        <pre className="wa-preview" aria-label="Message preview">{messageText(prompt.url)}</pre>
        <div className="wa-row">
          <a
            className="wa-send"
            href={prompt.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setPrompt(null)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 1 1 8.3 4.6zm5.4-7.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.1 8.1 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z" />
            </svg>
            Send on WhatsApp
          </a>
          <button type="button" className="wa-close" onClick={() => setPrompt(null)}>
            Skip
          </button>
        </div>
      </div>
    </>
  );
}
