// Show the "Send on WhatsApp" card (rendered by <WhatsAppPrompt /> in App.jsx).
//
// The backend returns a prefilled https://wa.me/<number>?text=... link in
// `whatsapp_url` after bookings, approvals, loyalty changes and user
// creation. Opening it needs a real click (popup blockers stop
// window.open after an await), so we show a card with a link instead.

const EVENT = "dqd:whatsapp";

export function showWhatsApp(url, title = "Send WhatsApp message") {
  if (!url || typeof url !== "string" || !url.startsWith("https://wa.me/")) return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { url, title } }));
}

export function onWhatsApp(handler) {
  const listener = (e) => handler(e.detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
