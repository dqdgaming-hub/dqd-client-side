import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { vec2 } from "gl-matrix";
import {
  CalendarDays,
  Clock,
  Coins,
  Gamepad2,
  Sparkles,
  Users,
  Tag,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  Zap,
  ChevronLeft,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { getGameItemsForBooking, redeemLoyaltySlot, getAvailableGameSlots, getUserLoyalty } from "../../api/userapi";
import UserLayout from "../../User/Userlayout";

/* ============================================================
   WAKANDA / VIBRANIUM THEME
   Void black + deep panther purple base, vibranium-cyan energy,
   royal Wakandan gold reserved for status/CTA accents only.
   ============================================================ */
const loyaltyRedeemerStyles = `
.loyalty-redeemer {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: clamp(20px, 4vw, 46px);
  background:
    radial-gradient(circle at 14% 8%, rgba(123, 47, 247, 0.24), transparent 36%),
    radial-gradient(circle at 88% 92%, rgba(0, 217, 255, 0.14), transparent 42%),
    radial-gradient(circle at 70% 4%, rgba(201, 169, 97, 0.08), transparent 32%),
    linear-gradient(135deg, #05030a 0%, #120a22 46%, #1c0e2e 100%);
  color: #f4eefc;
  box-shadow: 0 28px 90px rgba(5, 2, 14, 0.6), inset 0 0 0 1px rgba(123, 47, 247, 0.18);
  font-family: 'Rajdhani', 'Share Tech Mono', sans-serif;
}

.loyalty-redeemer * { box-sizing: border-box; }
.loyalty-redeemer h1, .loyalty-redeemer h2, .loyalty-redeemer h3 { font-family: 'Orbitron', sans-serif; }

/* ---------- ambient vibranium particle field (gl-matrix powered canvas) ---------- */
.coin-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0.9;
}

/* ---------- hero / progress ---------- */
.loyalty-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.loyalty-kicker {
  margin: 0 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c9a961;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.76rem;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(201, 169, 97, 0.1);
  border: 1px solid rgba(201, 169, 97, 0.3);
}

.loyalty-hero h2 {
  margin: 0;
  font-size: clamp(1.7rem, 4.4vw, 2.7rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  background: linear-gradient(120deg, #f4eefc 30%, #b78bff 65%, #00d9ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.loyalty-hero p {
  max-width: 540px;
  margin: 12px 0 0;
  color: rgba(244, 238, 252, 0.65);
  line-height: 1.55;
  font-size: 0.95rem;
}

.points-badge {
  flex: 0 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: conic-gradient(from 220deg, rgba(123,47,247,0.95), rgba(0,217,255,0.6), rgba(201,169,97,0.6), rgba(123,47,247,0.95));
  padding: 4px;
  animation: loyaltyHappyBounce 3s ease-in-out infinite;
}
.points-badge::after {
  content: "";
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #0c0717;
}
.points-badge > * { position: relative; z-index: 1; }
.points-badge svg { color: #c9a961; }
.points-badge strong { font-size: 2rem; font-weight: 900; font-family: 'Orbitron', sans-serif; color: #f4eefc; text-shadow: 0 0 18px rgba(123, 47, 247, 0.6); }
.points-badge span { color: rgba(244, 238, 252, 0.55); font-weight: 700; font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.05em; }
.points-badge small { color: #6fe9ff; font-weight: 700; font-size: 0.68rem; }

.step-rail {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 26px;
  font-weight: 800;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(244, 238, 252, 0.4);
}
.step-rail .step-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(123, 47, 247, 0.16);
  transition: color 220ms ease, background 220ms ease, border-color 220ms ease;
}
.step-rail .step-node .dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.74rem;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(244, 238, 252, 0.5);
  transition: background 220ms ease, color 220ms ease, transform 220ms ease;
}
.step-rail .step-node.active { color: #b78bff; background: rgba(123, 47, 247, 0.14); border-color: rgba(123, 47, 247, 0.45); }
.step-rail .step-node.active .dot { background: #7b2ff7; color: #fff; transform: scale(1.08); box-shadow: 0 0 14px rgba(123, 47, 247, 0.7); }
.step-rail .step-node.done { color: #6fe9ff; }
.step-rail .step-node.done .dot { background: #00d9ff; color: #06121a; }
.step-rail .rail-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(123,47,247,0.35), rgba(255,255,255,0.04));
}

/* ---------- select-game screen ---------- */
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(123, 47, 247, 0.25);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(244, 238, 252, 0.72);
  font-weight: 700;
  font-size: 0.78rem;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, color 160ms ease, transform 160ms ease;
}
.filter-chip:hover { transform: translateY(-1px); border-color: rgba(0, 217, 255, 0.5); }
.filter-chip.active { background: linear-gradient(120deg, #7b2ff7, #00a8cc); color: #fff; border-color: transparent; }

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 900;
  font-size: 1.05rem;
  margin-bottom: 14px;
}
.section-label .left { display: flex; align-items: center; gap: 8px; }

.item-picker-status {
  font-weight: 600;
  font-size: 0.8rem;
  color: rgba(244, 238, 252, 0.5);
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(123, 47, 247, 0.3);
  background: rgba(123, 47, 247, 0.08);
  color: #fff;
  font-size: 0.76rem;
  font-weight: 700;
  padding: 6px 13px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease;
}
.retry-btn:hover { background: rgba(123, 47, 247, 0.2); transform: translateY(-1px); }

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}

.item-card {
  position: relative;
  display: flex;
  flex-direction: column;
  text-align: left;
  border: 1px solid rgba(123, 47, 247, 0.2);
  border-radius: 18px;
  background: rgba(10, 6, 20, 0.5);
  color: #fff;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}
.item-card:hover { border-color: rgba(0, 217, 255, 0.5); box-shadow: 0 12px 28px rgba(0, 217, 255, 0.12); }
.item-card.active {
  border-color: #7b2ff7;
  box-shadow: 0 16px 34px rgba(123, 47, 247, 0.32);
  background: rgba(123, 47, 247, 0.08);
}

.item-card-media {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}
.item-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 320ms ease; }
.item-card:hover .item-card-media img { transform: scale(1.07); }
.item-card-media .item-card-fallback {
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: rgba(244, 238, 252, 0.3);
}
.item-card-media::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 55%, rgba(10,6,20,0.9) 100%);
}

.item-card-check {
  position: absolute; top: 9px; right: 9px; width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; z-index: 2;
  background: #7b2ff7; color: #fff; opacity: 0; transform: scale(0.6);
  transition: opacity 160ms ease, transform 160ms ease;
}
.item-card.active .item-card-check { opacity: 1; transform: scale(1); }

.item-card-cta {
  position: absolute; bottom: 9px; right: 9px; z-index: 2;
  display: flex; align-items: center; gap: 4px;
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  color: #06121a; background: #00d9ff; padding: 5px 10px; border-radius: 999px;
  opacity: 0; transform: translateY(6px);
  transition: opacity 180ms ease, transform 180ms ease;
}
.item-card:hover .item-card-cta { opacity: 1; transform: translateY(0); }

.item-card-body { display: grid; gap: 7px; padding: 12px 14px 14px; }
.item-card-name { font-weight: 800; font-size: 0.98rem; line-height: 1.2; font-family: 'Orbitron', sans-serif; }
.item-card-category {
  display: inline-flex; align-items: center; gap: 5px; width: fit-content;
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  color: #c9a961; background: rgba(201, 169, 97, 0.14); padding: 3px 9px; border-radius: 999px;
}
.item-card-meta { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: rgba(244, 238, 252, 0.68); }
.item-card-meta strong { color: #fff; }
.item-card-meta span { display: inline-flex; align-items: center; gap: 4px; }

.item-empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 11px;
  padding: 40px 16px; border: 1px dashed rgba(123, 47, 247, 0.3); border-radius: 18px;
  color: rgba(244, 238, 252, 0.6); font-weight: 700; text-align: center;
}

.item-skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.item-skeleton {
  aspect-ratio: 16 / 12; border-radius: 18px;
  background: linear-gradient(100deg, rgba(123,47,247,0.06) 30%, rgba(123,47,247,0.18) 50%, rgba(123,47,247,0.06) 70%);
  background-size: 200% 100%; animation: loyaltyShimmer 1.4s ease-in-out infinite;
}

/* ---------- shared layout / form screen ---------- */
.redeem-layout {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 20px;
  align-items: start;
}
@media (max-width: 880px) { .redeem-layout { grid-template-columns: 1fr; } }

.back-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
  flex-wrap: wrap;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid rgba(123, 47, 247, 0.28);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(244, 238, 252, 0.85);
  font-weight: 800;
  font-size: 0.82rem;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}
.back-btn:hover { background: rgba(123, 47, 247, 0.12); border-color: rgba(0, 217, 255, 0.5); transform: translateX(-2px); }

.chosen-game-chip {
  display: flex; align-items: center; gap: 10px;
  border: 1px solid rgba(201, 169, 97, 0.35);
  background: rgba(201, 169, 97, 0.08);
  border-radius: 999px;
  padding: 5px 14px 5px 5px;
}
.chosen-game-chip img {
  width: 34px; height: 34px; border-radius: 50%; object-fit: cover; display: block;
}
.chosen-game-chip .chosen-game-fallback {
  width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: rgba(255, 255, 255, 0.1); color: #c9a961;
}
.chosen-game-chip strong { font-size: 0.86rem; font-weight: 800; }
.chosen-game-chip span { display: block; font-size: 0.68rem; color: rgba(244, 238, 252, 0.55); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }

.redeem-panel {
  position: relative;
  display: grid;
  gap: 20px;
  padding: clamp(16px, 3vw, 26px);
  border: 1px solid rgba(123, 47, 247, 0.2);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.035);
  backdrop-filter: blur(20px);
}

.summary-panel {
  position: sticky;
  top: 16px;
  display: grid;
  gap: 18px;
  padding: clamp(16px, 3vw, 24px);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 20px;
  background: linear-gradient(165deg, rgba(123, 47, 247, 0.14), rgba(0, 217, 255, 0.05) 60%);
  backdrop-filter: blur(20px);
}

.summary-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  font-size: 1.08rem;
  margin: 0;
  font-family: 'Orbitron', sans-serif;
}

.redeem-panel label,
.summary-panel label {
  display: grid;
  gap: 9px;
  font-weight: 800;
  font-size: 0.92rem;
}

.redeem-panel label span,
.summary-panel label span {
  display: flex;
  align-items: center;
  gap: 7px;
  color: rgba(244, 238, 252, 0.85);
}

.redeem-panel select,
.redeem-panel input,
.redeem-panel textarea,
.summary-panel select,
.summary-panel input,
.summary-panel textarea {
  width: 100%;
  border: 1px solid rgba(123, 47, 247, 0.28);
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(8, 4, 16, 0.65);
  color: #fff;
  outline: none;
  font: inherit;
  transition: border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease;
}

.redeem-panel select:focus,
.redeem-panel input:focus,
.redeem-panel textarea:focus,
.summary-panel select:focus,
.summary-panel input:focus,
.summary-panel textarea:focus {
  border-color: #00d9ff;
  box-shadow: 0 0 0 4px rgba(0, 217, 255, 0.15);
  transform: translateY(-1px);
}

/* ---------- slot picker ---------- */
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding: 4px 2px;
}
.slot-grid::-webkit-scrollbar { width: 6px; }
.slot-grid::-webkit-scrollbar-thumb { background: rgba(123,47,247,0.3); border-radius: 999px; }

.slot-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 40px;
  border: 1px solid rgba(123, 47, 247, 0.24);
  border-radius: 12px;
  background: rgba(8, 4, 16, 0.6);
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}
.slot-btn:hover:not(:disabled) { transform: translateY(-2px); border-color: rgba(0, 217, 255, 0.5); }
.slot-btn.active {
  background: linear-gradient(120deg, #7b2ff7, #00a8cc);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 22px rgba(123, 47, 247, 0.35);
}
.slot-btn:disabled { opacity: 0.4; cursor: not-allowed; text-decoration: line-through; }

.slot-empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 16px;
  color: rgba(244, 238, 252, 0.55);
  font-size: 0.82rem;
  font-weight: 600;
  border: 1px dashed rgba(123, 47, 247, 0.25);
  border-radius: 12px;
}

/* ---------- points picker ---------- */
.points-picker { display: grid; gap: 13px; }
.points-picker-head { font-weight: 900; font-size: 0.95rem; }
.points-picker-head small { display: block; margin-top: 4px; font-weight: 600; color: rgba(244, 238, 252, 0.65); line-height: 1.45; }

.points-meter { height: 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); overflow: hidden; }
.points-meter-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #7b2ff7, #00d9ff); }

.point-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.point-chips button {
  min-width: 58px; min-height: 38px; border: 0; border-radius: 999px;
  background: rgba(255, 255, 255, 0.1); color: #fff; font-weight: 900; cursor: pointer;
  transition: transform 180ms ease, background 180ms ease, color 180ms ease;
}
.point-chips button:hover:not(:disabled) { transform: translateY(-2px) rotate(-1deg); }
.point-chips button.active { background: linear-gradient(120deg, #7b2ff7, #00a8cc); color: #fff; box-shadow: 0 10px 24px rgba(123, 47, 247, 0.35); }
.point-chips button:disabled, .redeem-submit:disabled { cursor: not-allowed; opacity: 0.45; }

.custom-points-row {
  display: flex; align-items: center; gap: 9px;
  font-size: 0.82rem; color: rgba(244, 238, 252, 0.62); font-weight: 700;
}
.custom-points-row input { flex: 1; }
.custom-points-row .available-hint {
  white-space: nowrap;
  font-size: 0.76rem;
  font-weight: 700;
  color: #c9a961;
  background: rgba(201, 169, 97, 0.1);
  padding: 5px 10px;
  border-radius: 999px;
}

.redeem-warning, .redeem-error, .redeem-success {
  display: flex; align-items: flex-start; gap: 9px;
  border-radius: 14px; padding: 12px 14px; line-height: 1.45; font-size: 0.88rem;
}
.redeem-warning { background: rgba(201, 169, 97, 0.14); color: #e7d6a8; }
.redeem-error { background: rgba(255, 80, 110, 0.15); color: #ffc3cf; }
.redeem-success { background: rgba(0, 217, 255, 0.14); color: #bdf3ff; }

.redeem-submit {
  position: relative;
  min-height: 54px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(120deg, #7b2ff7, #4f1ba8 55%, #00a8cc);
  color: #fff;
  font-weight: 950;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(123, 47, 247, 0.35);
  transition: transform 180ms ease, box-shadow 180ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.redeem-submit:not(:disabled):hover { transform: translateY(-3px); box-shadow: 0 22px 44px rgba(123, 47, 247, 0.45), 0 0 0 1px rgba(0, 217, 255, 0.3); }

@keyframes loyaltyHappyBounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-7px) scale(1.025); } }
@keyframes loyaltyShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

@media (max-width: 720px) {
  .loyalty-hero { align-items: stretch; flex-direction: column; }
  .points-badge { width: 112px; height: 112px; align-self: flex-start; }
  .item-grid, .item-skeleton-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .slot-grid { grid-template-columns: repeat(auto-fill, minmax(92px, 1fr)); }
  .redeem-layout { grid-template-columns: 1fr; }
}
`;

// Stable empty-array reference so the default prop never causes
// effects/useCallback to think "gamingItems" changed every render.
const EMPTY_ITEMS = [];

const buildPointOptions = (loyaltyPoints) => {
  const maxPoints = Math.floor(Number(loyaltyPoints || 0) / 100) * 100;
  if (maxPoints < 100) return [100];
  return Array.from({ length: maxPoints / 100 }, (_, index) => (index + 1) * 100);
};

/* The gaming items API returns a flat array of rich item objects:
   { id, name, description, image, image_url, price_per_hour,
     min_capacity, max_capacity, category, category_name }
   This also tolerates paginated/wrapped shapes ({ results }, { data }, { items }). */
const normalizeGameItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const toTimeLabel = (time) => String(time || "").slice(0, 5);

const formatPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString("en-IN") : value;
};

const describeFetchError = (err) => {
  const status = err?.response?.status;
  const serverMessage =
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    (typeof err?.response?.data === "string" ? err.response.data : null);

  if (status === 401 || status === 403) {
    return "You're not authorized to view game items. Try logging in again.";
  }
  if (status === 404) {
    return "Game items endpoint not found (404). Check the API route is registered in urls.py.";
  }
  if (status === 500) {
    return `Server error loading game items (500)${serverMessage ? `: ${serverMessage}` : ". Check the backend logs/imports."}`;
  }
  if (!err?.response) {
    return "Couldn't reach the server. Check your network connection or API base URL.";
  }
  return serverMessage || `Game items failed to load (status ${status ?? "unknown"}).`;
};

/* Ambient floating vibranium-dust field rendered on a canvas, driven by
   gl-matrix vec2 physics (position + velocity integration with edge
   wrap-around). Purely decorative — sits behind the hero content. */
function CoinField({ count = 18 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Vibranium palette: panther purple, energy cyan, royal gold (rare)
    const palette = ["123, 47, 247", "0, 217, 255", "0, 217, 255", "201, 169, 97"];
    const particles = Array.from({ length: count }, () => ({
      pos: vec2.fromValues(Math.random() * width, Math.random() * height),
      vel: vec2.fromValues((Math.random() - 0.5) * 0.16, -0.05 - Math.random() * 0.12),
      radius: 1.4 + Math.random() * 3,
      color: palette[Math.floor(Math.random() * palette.length)],
      alpha: 0.12 + Math.random() * 0.26,
      drift: Math.random() * Math.PI * 2,
    }));

    const tick = (t) => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        // gentle horizontal sway layered on top of the base velocity
        const sway = Math.sin(t * 0.0006 + p.drift) * 0.05;
        const step = vec2.fromValues(p.vel[0] + sway, p.vel[1]);
        vec2.add(p.pos, p.pos, step);

        if (p.pos[1] < -12) p.pos[1] = height + 12;
        if (p.pos[0] < -12) p.pos[0] = width + 12;
        if (p.pos[0] > width + 12) p.pos[0] = -12;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${p.color}, ${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.arc(p.pos[0], p.pos[1], p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="coin-field" aria-hidden="true" />;
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } },
};

export default function LoyaltySlotRedeemer({
  gamingItems = EMPTY_ITEMS,
  onRedeemed,
}) {
  const [step, setStep] = useState("select"); // "select" | "form"
  const [loadedGamingItems, setLoadedGamingItems] = useState(gamingItems);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [form, setForm] = useState({
    item: "",
    booking_date: "",
    start_time: "",
    points_to_redeem: 100,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [customPointsInput, setCustomPointsInput] = useState(String(form.points_to_redeem));

  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [redeemableHours, setRedeemableHours] = useState(0);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const selectedHours = useMemo(
    () => Number(form.points_to_redeem) / 100,
    [form.points_to_redeem]
  );
  const pointOptions = useMemo(() => buildPointOptions(loyaltyPoints), [loyaltyPoints]);
  const selectedItem = useMemo(
    () => loadedGamingItems.find((item) => item.id === form.item) || null,
    [loadedGamingItems, form.item]
  );
  const maxRedeemable = useMemo(
    () => Math.floor(Number(loyaltyPoints || 0) / 100) * 100,
    [loyaltyPoints]
  );
  const meterPercent = useMemo(() => {
    if (!maxRedeemable) return 0;
    return Math.min(100, Math.round((Number(form.points_to_redeem) / maxRedeemable) * 100));
  }, [form.points_to_redeem, maxRedeemable]);

  const selectedEndTime = useMemo(() => {
    if (!form.start_time) return "";
    const [hours, minutes] = form.start_time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours + selectedHours, minutes, 0, 0);
    return date.toTimeString().slice(0, 5);
  }, [form.start_time, selectedHours]);

  const categories = useMemo(() => {
    const set = new Set(
      loadedGamingItems.map((item) => item.category_name).filter(Boolean)
    );
    return ["all", ...Array.from(set)];
  }, [loadedGamingItems]);

  const visibleItems = useMemo(() => {
    if (activeCategory === "all") return loadedGamingItems;
    return loadedGamingItems.filter((item) => item.category_name === activeCategory);
  }, [loadedGamingItems, activeCategory]);

  // Only adopt the prop's items if the parent actually gave us some;
  // never let an empty default prop overwrite items we've fetched ourselves.
  useEffect(() => {
    if (gamingItems.length === 0) return;
    setLoadedGamingItems(gamingItems);
  }, [gamingItems]);

  const loadItems = useCallback(async () => {
    setItemsLoading(true);
    setItemsError("");

    try {
      const data = await getGameItemsForBooking();
      const items = normalizeGameItems(data);
      setLoadedGamingItems(items);
      if (!items.length) {
        setItemsError("No game items found. Make sure active, non-deleted items exist on the backend.");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load gaming items:", err);
      setItemsError(describeFetchError(err));
    } finally {
      setItemsLoading(false);
    }
  }, []);

  const loadLoyalty = useCallback(async () => {
    try {
      const data = await getUserLoyalty();
      setLoyaltyPoints(data.loyalty_points);
      setRedeemableHours(data.redeemable_hours);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load loyalty balance:", err);
    }
  }, []);

  const loadSlots = useCallback(async () => {
    if (!form.item || !form.booking_date) {
      setSlots([]);
      return;
    }
    try {
      setSlotsLoading(true);
      const data = await getAvailableGameSlots(form.item, form.booking_date);
      setSlots(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to load slots:", err);
    } finally {
      setSlotsLoading(false);
    }
  }, [form.item, form.booking_date]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadLoyalty();
  }, [loadLoyalty]);

  useEffect(() => {
    if (gamingItems.length) return;
    loadItems();
  }, [gamingItems.length, loadItems]);

  useEffect(() => {
    if (Number(form.points_to_redeem) <= loyaltyPoints) return;
    const fallbackPoints = Math.max(100, maxRedeemable);
    setForm((current) => ({ ...current, points_to_redeem: fallbackPoints }));
  }, [form.points_to_redeem, loyaltyPoints, maxRedeemable]);

  // Keep the free-typing buffer in sync when points change via chips or clamping,
  // so the custom input doesn't show a stale value after those interactions.
  useEffect(() => {
    setCustomPointsInput(String(form.points_to_redeem));
  }, [form.points_to_redeem]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === "booking_date" ? { start_time: "" } : {}) }));
  };

  const selectItem = (itemId) => {
    setForm((current) => ({ ...current, item: itemId, start_time: "" }));
    setResult(null);
    setError("");
    setStep("form");
  };

  const goBackToSelect = () => {
    setStep("select");
  };

  const handleCustomPointsChange = (event) => {
    // Let the user type freely (including partial values like "" or "5"
    // or "50") without snapping/rounding on every keystroke.
    setCustomPointsInput(event.target.value);
  };

  const commitCustomPoints = () => {
    const raw = Number(customPointsInput) || 0;
    const rounded = Math.round(raw / 100) * 100;
    const capped = Math.max(100, Math.min(rounded, maxRedeemable || 100));
    setForm((current) => ({ ...current, points_to_redeem: capped }));
    setCustomPointsInput(String(capped));
  };

  const submitRedemption = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await redeemLoyaltySlot({
        ...form,
        points_to_redeem: Number(form.points_to_redeem),
      });
      setResult(data.booking);
      await loadLoyalty();
      await loadSlots();
      onRedeemed?.(data.booking);
    } catch (err) {
      setError(
        err?.response?.data?.item?.[0] ||
          err?.response?.data?.points_to_redeem?.[0] ||
          err?.response?.data?.non_field_errors?.[0] ||
          err?.response?.data?.detail ||
          "Could not redeem points right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedImage = selectedItem?.image_url || selectedItem?.image;

  return (
    <UserLayout>
      <style>{loyaltyRedeemerStyles}</style>
      <section className="loyalty-redeemer">
        <CoinField count={18} />

          <br/> <br/> <br/>
        <div className="loyalty-hero">
          <div>
            <p className="loyalty-kicker"><Sparkles size={14} /> Loyalty Vault</p>
            <br/><br/>
            <h2>Forge your points into play time</h2>
            <p>100 points = 1 hour, 200 points = 2 hours, and so on. Choose your arena, then claim your slot — for Wakanda, for the win.</p>
          </div>
          <div className="points-badge">
            <Coins size={24} />
            <strong>{loyaltyPoints}</strong>
            <span>points</span>
            {redeemableHours > 0 && <small>~{redeemableHours} hrs redeemable</small>}
          </div>
        </div>

        <div className="step-rail">
          <span className={`step-node ${step === "select" ? "active" : "done"}`}>
            <span className="dot">{step === "select" ? "1" : <Check size={12} strokeWidth={3} />}</span>
            Choose arena
          </span>
          <span className="rail-line" />
          <span className={`step-node ${step === "form" ? "active" : ""}`}>
            <span className="dot">2</span>
            Configure slot
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === "select" ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="section-label">
                <span className="left">
                  <Gamepad2 size={18} /> Choose a game item
                  {itemsLoading && <span className="item-picker-status">Loading...</span>}
                </span>
                {!itemsLoading && (
                  <button type="button" className="retry-btn" onClick={loadItems}>
                    <RefreshCw size={13} /> Refresh
                  </button>
                )}
              </div>

              {categories.length > 2 && (
                <div className="filter-row">
                  <SlidersHorizontal size={14} color="rgba(244,238,252,0.45)" />
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      className={`filter-chip ${activeCategory === cat ? "active" : ""}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat === "all" ? "All games" : cat}
                    </button>
                  ))}
                </div>
              )}

              {itemsLoading && loadedGamingItems.length === 0 && (
                <div className="item-skeleton-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div className="item-skeleton" key={i} />
                  ))}
                </div>
              )}

              {!itemsLoading && visibleItems.length > 0 && (
                <motion.div
                  className="item-grid"
                  role="radiogroup"
                  aria-label="Game item"
                  variants={gridVariants}
                  initial="hidden"
                  animate="show"
                >
                  {visibleItems.map((item) => {
                    const isActive = form.item === item.id;
                    const imageSrc = item.image_url || item.image;
                    return (
                      <motion.button
                        type="button"
                        key={item.id}
                        role="radio"
                        aria-checked={isActive}
                        className={`item-card ${isActive ? "active" : ""}`}
                        onClick={() => selectItem(item.id)}
                        variants={cardVariants}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="item-card-media">
                          {imageSrc ? (
                            <motion.img
                              layoutId={`item-img-${item.id}`}
                              src={imageSrc}
                              alt={item.name}
                              loading="lazy"
                            />
                          ) : (
                            <span className="item-card-fallback"><Gamepad2 size={28} /></span>
                          )}
                          <span className="item-card-check"><Check size={14} strokeWidth={3} /></span>
                          <span className="item-card-cta">Select <ArrowRight size={11} /></span>
                        </span>
                        <span className="item-card-body">
                          <span className="item-card-name">{item.name}</span>
                          {item.category_name && (
                            <span className="item-card-category"><Tag size={11} />{item.category_name}</span>
                          )}
                          <span className="item-card-meta">
                            <strong>INR {formatPrice(item.price_per_hour)}/hr</strong>
                            {(item.min_capacity || item.max_capacity) && (
                              <span><Users size={12} />{item.min_capacity}-{item.max_capacity}</span>
                            )}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}

              {!itemsLoading && visibleItems.length === 0 && (
                <div className="item-empty-state">
                  <AlertTriangle size={20} />
                  {itemsError || "No game items available right now."}
                  <button type="button" className="retry-btn" onClick={loadItems}>
                    <RefreshCw size={13} /> Try again
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submitRedemption}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="back-row">
                <button type="button" className="back-btn" onClick={goBackToSelect}>
                  <ChevronLeft size={15} /> Change game
                </button>
                {selectedItem && (
                  <div className="chosen-game-chip">
                    {selectedImage ? (
                      <motion.img layoutId={`item-img-${selectedItem.id}`} src={selectedImage} alt={selectedItem.name} />
                    ) : (
                      <span className="chosen-game-fallback"><Gamepad2 size={16} /></span>
                    )}
                    <span>
                      <span style={{ fontSize: "0.62rem" }}>Booking for</span>
                      <strong>{selectedItem.name}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="redeem-layout">
                {/* LEFT: date + slot picker */}
                <div className="redeem-panel">
                  <label>
                    <span><CalendarDays size={16} /> Date</span>
                    <input type="date" name="booking_date" value={form.booking_date} onChange={updateForm} required />
                  </label>

                  <div>
                    <div className="section-label" style={{ marginBottom: 10 }}>
                      <span className="left"><Clock size={17} /> Available slots</span>
                      {slotsLoading && <span className="item-picker-status">Checking...</span>}
                    </div>

                    <div className="slot-grid">
                      {!form.item || !form.booking_date ? (
                        <div className="slot-empty">
                          <CalendarDays size={15} /> Pick a date to see open slots.
                        </div>
                      ) : slotsLoading ? (
                        <div className="slot-empty">
                          <Clock size={15} /> Checking availability...
                        </div>
                      ) : slots.length === 0 ? (
                        <div className="slot-empty">
                          <AlertTriangle size={15} /> No slots configured for this day.
                        </div>
                      ) : (
                        slots.map((slot) => (
                          <motion.button
                            key={slot.start_time}
                            type="button"
                            disabled={!slot.available}
                            className={`slot-btn ${form.start_time === slot.start_time ? "active" : ""}`}
                            whileTap={slot.available ? { scale: 0.94 } : undefined}
                            onClick={() =>
                              setForm((prev) => ({ ...prev, start_time: slot.start_time }))
                            }
                          >
                            {!slot.available && <Lock size={11} />}
                            {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                          </motion.button>
                        ))
                      )}
                    </div>
                  </div>

                  <label>
                    <span>Notes</span>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={updateForm}
                      placeholder="Any note for the staff?"
                      rows="3"
                    />
                  </label>
                </div>

                {/* RIGHT: points + summary */}
                <div className="summary-panel">
                  <p className="summary-title"><Sparkles size={17} /> Your slot</p>

                  <div className="points-picker">
                    <div className="points-picker-head">
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Zap size={15} color="#00d9ff" /> Redeem points
                      </span>
                      <small>
                        {form.points_to_redeem} points books {selectedHours} hour{selectedHours > 1 ? "s" : ""}
                        {selectedEndTime ? `, ending at ${selectedEndTime}` : ""}
                        {selectedItem ? ` on ${selectedItem.name}` : ""}
                        {!form.start_time && " — pick a start time first"}
                      </small>
                    </div>

                    <div className="points-meter">
                      <motion.div
                        className="points-meter-fill"
                        animate={{ width: `${meterPercent}%` }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      />
                    </div>

                    <div className="point-chips">
                      {pointOptions.map((points) => (
                        <button
                          type="button"
                          key={points}
                          className={Number(form.points_to_redeem) === points ? "active" : ""}
                          disabled={points > loyaltyPoints || !form.start_time}
                          onClick={() => setForm((current) => ({ ...current, points_to_redeem: points }))}
                        >
                          {points}
                        </button>
                      ))}
                    </div>

                    <div className="custom-points-row">
                      <Coins size={14} /> Custom:
                      <input
                        type="number"
                        min={100}
                        step={100}
                        max={maxRedeemable}
                        value={customPointsInput}
                        onChange={handleCustomPointsChange}
                        onBlur={commitCustomPoints}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitCustomPoints();
                          }
                        }}
                        placeholder="e.g. 500"
                      />
                      <span className="available-hint">{maxRedeemable} available</span>
                    </div>
                  </div>

                  {loyaltyPoints < 100 && (
                    <div className="redeem-warning">
                      <AlertTriangle size={16} /> You need at least 100 points before you can redeem a slot.
                    </div>
                  )}
                  {itemsError && loadedGamingItems.length > 0 && (
                    <div className="redeem-warning"><AlertTriangle size={16} /> {itemsError}</div>
                  )}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="redeem-error"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        <AlertTriangle size={16} /> {error}
                      </motion.div>
                    )}
                    {result && (
                      <motion.div
                        className="redeem-success"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        <Sparkles size={18} />
                        Booked {result.item_name} from {toTimeLabel(result.start_time)} to {toTimeLabel(result.end_time)}.
                        Balance: {result.remaining_loyalty_points} points.
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    className="redeem-submit"
                    type="submit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                      loading ||
                      itemsLoading ||
                      loyaltyPoints < 100 ||
                      !form.item ||
                      !form.start_time ||
                      form.points_to_redeem < 100
                    }
                  >
                    {loading ? "Claiming your slot..." : <>
                      <Sparkles size={16} /> Claim {selectedHours} hr slot
                    </>}
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      <br/><br/>
      </section>
    </UserLayout>
  );
}