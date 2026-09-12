import { useEffect, useState, useRef, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  RefreshCw,
  Wallet,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Percent,
  Receipt,
  BarChart3,
  FileBarChart,
  ClipboardList,
  Scale,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  DollarSign,
  Layers,
  AlertCircle,
  LineChart as LineChartIcon,
} from "lucide-react";

const theme = {
  bg: "#0a0a0f",
  surface: "#0d0d1a",
  card: "#111122",
  border: "#1a1a2e",
  cyan: "#00f5ff",
  pink: "#ff006e",
  yellow: "#ffd60a",
  green: "#39ff14",
  purple: "#7b2fff",
  text: "#e0e0ff",
  muted: "#6b7280",
};

/* ───────────────────────── date helpers ───────────────────────── */

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n) { return String(n).padStart(2, "0"); }
function toISODate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function isSameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d) {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}
function endOfWeek(d) {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
}
function buildMonthGrid(year, month) {
  const gridStart = startOfWeek(new Date(year, month, 1));
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}
function formatShortDate(d) { return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`; }

function getPeriodLabel(period, anchorDate, customRange) {
  if (period === "weekly") {
    const s = startOfWeek(anchorDate);
    const e = endOfWeek(anchorDate);
    return `${formatShortDate(s)} – ${formatShortDate(e)}, ${e.getFullYear()}`;
  }
  if (period === "monthly") return `${MONTH_LABELS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
  if (period === "yearly") return `${anchorDate.getFullYear()}`;
  if (period === "custom") {
    if (!customRange?.start) return "Select range";
    const s = customRange.start;
    const e = customRange.end || customRange.start;
    return `${formatShortDate(s)} – ${formatShortDate(e)}, ${e.getFullYear()}`;
  }
  return "Today";
}

/* ───────────────────────── styles ───────────────────────── */

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500&display=swap');

  .acct-root, .acct-root *, .acct-root *::before, .acct-root *::after { box-sizing: border-box; }

  .acct-root {
    min-height: 100vh;
    color: ${theme.text};
    font-family: 'Inter', sans-serif;
    padding: 2rem 1.5rem;
  }

  .acct-root button { font: inherit; }
  .acct-root button:focus-visible,
  .acct-root [tabindex]:focus-visible {
    outline: 2px solid ${theme.cyan};
    outline-offset: 2px;
  }

  /* ── Header ── */
  .acct-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .acct-title {
    font-family: 'Orbitron', monospace;
    font-size: 1.6rem;
    font-weight: 900;
    background: linear-gradient(135deg, ${theme.cyan}, ${theme.purple});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .acct-title-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 0.3rem;
    flex-wrap: wrap;
  }
  .acct-title-sub {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    color: ${theme.muted};
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  .live-pill {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.68rem;
    color: ${theme.muted};
    letter-spacing: 0.04em;
  }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${theme.green};
    animation: pulse 1.8s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

  /* ── Controls ── */
  .acct-controls {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .segmented {
    display: flex;
    background: ${theme.surface};
    border: 1px solid ${theme.border};
    padding: 3px;
    gap: 2px;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
  }
  .segmented-btn {
    background: transparent;
    border: none;
    color: ${theme.muted};
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.45rem 0.8rem;
    cursor: pointer;
    transition: color 0.2s, background 0.2s;
  }
  .segmented-btn:hover { color: ${theme.text}; }
  .segmented-btn.active {
    background: linear-gradient(135deg, ${theme.cyan}22, ${theme.purple}22);
    color: ${theme.cyan};
    box-shadow: inset 0 0 0 1px ${theme.cyan}55;
  }

  .picker-trigger-wrap { position: relative; }
  .picker-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: ${theme.surface};
    border: 1px solid ${theme.cyan}44;
    color: ${theme.text};
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.02em;
    padding: 0.45rem 0.9rem;
    cursor: pointer;
    white-space: nowrap;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: border-color 0.2s;
  }
  .picker-trigger:hover { border-color: ${theme.cyan}; }
  .picker-trigger svg { color: ${theme.cyan}; flex-shrink: 0; }

  .cyber-btn {
    background: transparent;
    border: 1px solid ${theme.cyan};
    color: ${theme.cyan};
    padding: 0.45rem 1.2rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    cursor: pointer;
    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
    transition: background 0.2s, color 0.2s;
  }
  .cyber-btn:hover { background: ${theme.cyan}20; }
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0;
  }
  .icon-btn.spinning svg { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Date picker popover ── */
  .picker-pop {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background: ${theme.card};
    border: 1px solid ${theme.cyan}33;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
    padding: 1rem;
    width: 280px;
    z-index: 60;
    animation: pickerIn 0.15s ease-out;
  }
  @keyframes pickerIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .picker-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
  .picker-nav-btn {
    background: transparent;
    border: 1px solid ${theme.border};
    color: ${theme.muted};
    padding: 0.25rem;
    display: flex;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .picker-nav-btn:hover { color: ${theme.cyan}; border-color: ${theme.cyan}55; }
  .picker-nav-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    color: ${theme.text};
    letter-spacing: 0.06em;
  }
  .picker-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 0.3rem; }
  .picker-weekdays span {
    text-align: center;
    font-size: 0.6rem;
    color: ${theme.muted};
    font-family: 'Share Tech Mono', monospace;
  }
  .picker-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .picker-day {
    background: transparent;
    border: 1px solid transparent;
    color: ${theme.text};
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.7rem;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .picker-day:hover { border-color: ${theme.cyan}55; }
  .picker-day.muted { color: ${theme.muted}66; }
  .picker-day.today { border-color: ${theme.purple}88; }
  .picker-day.selected { background: ${theme.cyan}22; color: ${theme.cyan}; }
  .picker-day.edge { background: ${theme.cyan}; color: ${theme.bg}; font-weight: 700; }
  .picker-month-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .picker-month-cell {
    background: transparent;
    border: 1px solid ${theme.border};
    color: ${theme.text};
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.72rem;
    padding: 0.55rem 0.3rem;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }
  .picker-month-cell:hover { border-color: ${theme.cyan}55; color: ${theme.cyan}; }
  .picker-month-cell.selected { background: ${theme.cyan}22; border-color: ${theme.cyan}; color: ${theme.cyan}; }
  .picker-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.85rem;
    padding-top: 0.75rem;
    border-top: 1px solid ${theme.border};
  }
  .picker-range-label { font-family: 'Share Tech Mono', monospace; font-size: 0.66rem; color: ${theme.muted}; }
  .picker-apply-btn {
    background: ${theme.cyan};
    color: ${theme.bg};
    border: none;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.66rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
  }
  .picker-apply-btn:disabled { background: ${theme.border}; color: ${theme.muted}; cursor: not-allowed; }

  /* ── Error banner ── */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: ${theme.pink}11;
    border: 1px solid ${theme.pink}44;
    color: ${theme.pink};
    padding: 0.7rem 1rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    margin-bottom: 1.5rem;
  }

  /* ── Hero KPI cards ── */
  .hero-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .hero-card {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.3rem 1.4rem;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px);
    transition: transform 0.2s, border-color 0.2s;
  }
  .hero-card:hover { transform: translateY(-3px); }
  .hero-card.cyan   { border-color: ${theme.cyan}33; }
  .hero-card.green  { border-color: ${theme.green}33; }
  .hero-card.purple { border-color: ${theme.purple}33; }
  .hero-card.yellow { border-color: ${theme.yellow}33; }
  .hero-card.cyan:hover   { border-color: ${theme.cyan}; }
  .hero-card.green:hover  { border-color: ${theme.green}; }
  .hero-card.purple:hover { border-color: ${theme.purple}; }
  .hero-card.yellow:hover { border-color: ${theme.yellow}; }
  .hero-icon-badge {
    width: 44px; height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-body { flex: 1; min-width: 0; }
  .hero-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${theme.muted};
    margin-bottom: 0.4rem;
  }
  .hero-value {
    font-family: 'Orbitron', monospace;
    font-size: 1.45rem;
    font-weight: 900;
    color: ${theme.text};
    line-height: 1.1;
    margin-bottom: 0.3rem;
  }
  .hero-sub { font-size: 0.7rem; color: ${theme.muted}; }

  /* ── Skeleton loading ── */
  .skeleton {
    display: inline-block;
    background: linear-gradient(90deg, ${theme.border} 25%, ${theme.surface} 50%, ${theme.border} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }
  .skeleton-text { width: 80px; height: 1.1rem; }
  .skeleton-text-sm { width: 60px; height: 0.85rem; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  /* ── Chart panel ── */
  .chart-panel {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.5rem;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
  }
  .chart-panel::before {
    content: 'REVENUE ANALYTICS';
    position: absolute;
    top: 0.9rem; right: 1.2rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    color: ${theme.cyan}55;
  }
  .chart-panel-title {
    font-family: 'Orbitron', monospace;
    font-size: 0.85rem;
    font-weight: 700;
    color: ${theme.cyan};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .chart-panel-title::before { content: '▶'; font-size: 0.6rem; }

  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line { stroke: ${theme.border} !important; }
  .recharts-text { fill: ${theme.muted} !important; font-family: 'Share Tech Mono', monospace !important; font-size: 11px !important; }

  .chart-tooltip {
    background: ${theme.card};
    border: 1px solid ${theme.cyan}55;
    padding: 0.7rem 1rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.75rem;
    color: ${theme.text};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
  .chart-tooltip-label { color: ${theme.cyan}; margin-bottom: 0.4rem; letter-spacing: 0.1em; }
  .chart-tooltip-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.15rem; }
  .chart-tooltip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── Financial ledger table ── */
  .table-panel {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 0.5rem 1.2rem 1.2rem;
    margin-bottom: 2rem;
  }
  .table-scroll { overflow-x: auto; }
  .financial-table { width: 100%; border-collapse: collapse; min-width: 420px; }
  .financial-table thead th {
    text-align: left;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${theme.muted};
    padding: 0.9rem 0.6rem 0.6rem;
    border-bottom: 1px solid ${theme.border};
  }
  .financial-table thead th.num { text-align: right; }
  .ft-group-row td {
    padding: 0.8rem 0.6rem 0.4rem 0.9rem;
    font-family: 'Orbitron', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .ft-group-row.cyan td   { color: ${theme.cyan};   border-left: 2px solid ${theme.cyan}; }
  .ft-group-row.purple td { color: ${theme.purple}; border-left: 2px solid ${theme.purple}; }
  .ft-group-row.green td  { color: ${theme.green};  border-left: 2px solid ${theme.green}; }
  .ft-row td { padding: 0.65rem 0.6rem; border-bottom: 1px solid ${theme.border}; font-size: 0.82rem; color: ${theme.text}; }
  .ft-row:hover td { background: ${theme.surface}; }
  .ft-row td:first-child { display: flex; align-items: center; gap: 0.6rem; }
  .ft-icon-badge {
    width: 26px; height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .financial-table td.num { text-align: right; font-family: 'Share Tech Mono', monospace; }
  .financial-table td.num.pos { color: ${theme.green}; }
  .financial-table td.num.neg { color: ${theme.pink}; }

  /* ── Nav Tiles ── */
  .nav-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  .nav-tile {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    padding: 1.5rem 1.2rem;
    cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    transition: transform 0.2s, border-color 0.2s, background 0.2s;
  }
  .nav-tile:hover { transform: translateY(-4px); background: ${theme.surface}; }
  .nav-tile.t-cyan  { border-color: ${theme.cyan}33;  }
  .nav-tile.t-green { border-color: ${theme.green}33; }
  .nav-tile.t-purple{ border-color: ${theme.purple}33;}
  .nav-tile.t-pink  { border-color: ${theme.pink}33;  }
  .nav-tile.t-cyan:hover  { border-color: ${theme.cyan};   }
  .nav-tile.t-green:hover { border-color: ${theme.green};  }
  .nav-tile.t-purple:hover{ border-color: ${theme.purple}; }
  .nav-tile.t-pink:hover  { border-color: ${theme.pink};   }
  .nav-tile-icon { display: flex; }
  .nav-tile.t-cyan   .nav-tile-icon { color: ${theme.cyan};   }
  .nav-tile.t-green  .nav-tile-icon { color: ${theme.green};  }
  .nav-tile.t-purple .nav-tile-icon { color: ${theme.purple}; }
  .nav-tile.t-pink   .nav-tile-icon { color: ${theme.pink};   }
  .nav-tile-label {
    font-family: 'Orbitron', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .nav-tile.t-cyan   .nav-tile-label { color: ${theme.cyan};   }
  .nav-tile.t-green  .nav-tile-label { color: ${theme.green};  }
  .nav-tile.t-purple .nav-tile-label { color: ${theme.purple}; }
  .nav-tile.t-pink   .nav-tile-label { color: ${theme.pink};   }
  .nav-tile-desc { font-size: 0.72rem; color: ${theme.muted}; font-family: 'Share Tech Mono', monospace; }

  /* ── Section divider ── */
  .section-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Share Tech Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: ${theme.muted};
    border-left: 2px solid ${theme.cyan};
    padding-left: 0.6rem;
    margin-bottom: 1rem;
  }
  .section-label svg { color: ${theme.cyan}; }

  @media (max-width: 640px) {
    .acct-header { flex-direction: column; align-items: flex-start; }
    .acct-controls { width: 100%; }
    .segmented { flex-wrap: wrap; }
    .picker-pop { right: auto; left: 0; }
    .hero-grid { grid-template-columns: repeat(2, 1fr); }
    .nav-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    .acct-root * { animation: none !important; transition: none !important; }
  }
`;

/* ───────────────────────── data definitions ───────────────────────── */

const PERIOD_DEFS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
  { key: "custom", label: "Custom" },
];

const HERO_DEFS = [
  { key: "total_bookings", label: "Total Bookings", icon: Gamepad2, accent: "cyan", currency: false, sub: "All sessions this period" },
  { key: "net_revenue", label: "Net Revenue", icon: Wallet, accent: "green", currency: true, sub: "After discounts" },
  { key: "profit", label: "Profit", icon: TrendingUp, accent: "purple", currency: true, sub: "Net earnings" },
  { key: "pending_payment", label: "Pending Payment", icon: Clock, accent: "yellow", currency: true, sub: "Outstanding dues" },
];

const METRIC_GROUPS = [
  {
    title: "Bookings",
    accent: "cyan",
    icon: ClipboardList,
    rows: [
      { key: "total_bookings", label: "Total Bookings", icon: Layers, accent: "cyan" },
      { key: "completed_bookings", label: "Completed", icon: CheckCircle2, accent: "green" },
      { key: "cancelled_bookings", label: "Cancelled", icon: XCircle, accent: "pink" },
      { key: "pending_bookings", label: "Pending", icon: Clock, accent: "yellow" },
    ],
  },
  {
    title: "Revenue & Payments",
    accent: "purple",
    icon: Wallet,
    rows: [
      { key: "gross_revenue", label: "Gross Revenue", icon: DollarSign, accent: "cyan", currency: true },
      { key: "discount", label: "Discount Given", icon: Percent, accent: "pink", currency: true },
      { key: "net_revenue", label: "Net Revenue", icon: Receipt, accent: "green", currency: true },
      { key: "amount_received", label: "Amount Received", icon: CreditCard, accent: "cyan", currency: true },
      { key: "pending_payment", label: "Pending Payment", icon: Clock, accent: "yellow", currency: true },
      { key: "average_booking", label: "Average Booking Value", icon: BarChart3, accent: "purple", currency: true },
    ],
  },
  {
    title: "Profitability",
    accent: "green",
    icon: Scale,
    rows: [
      { key: "profit", label: "Profit", icon: TrendingUp, accent: "green", currency: true, tone: "pos" },
      { key: "loss", label: "Loss", icon: TrendingDown, accent: "pink", currency: true, tone: "neg" },
    ],
  },
];

const NAV_TILES = [
  { label: "Revenue Chart", desc: "Analytics & trends", accent: "t-cyan", icon: LineChartIcon, path: "/admin/accounting/chart" },
  { label: "Booking Ledger", desc: "Transaction history", accent: "t-green", icon: ClipboardList, path: "/admin/accounting/bookings" },
  { label: "Profit & Loss", desc: "P&L statement", accent: "t-purple", icon: Scale, path: "/admin/accounting/profit-loss" },
  { label: "Reports", desc: "Export & sync", accent: "t-pink", icon: FileBarChart, path: "/admin/accounting/report" },
];

/* ───────────────────────── chart tooltip ───────────────────────── */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-row" style={{ color: p.color || p.stroke }}>
          <span className="chart-tooltip-dot" style={{ background: p.color || p.stroke }} />
          {p.name}: {p.dataKey === "bookings" ? Number(p.value).toLocaleString("en-IN") : `₹${Number(p.value).toLocaleString("en-IN")}`}
        </div>
      ))}
    </div>
  );
};

/* ───────────────────────── period picker popover ───────────────────────── */

function PeriodPicker({ period, anchorDate, customRange, onSelectAnchor, onSelectCustomRange }) {
  const initialView = period === "custom" ? (customRange?.start || new Date()) : (anchorDate || new Date());
  const [viewDate, setViewDate] = useState(new Date(initialView));
  const [draftRange, setDraftRange] = useState({ start: customRange?.start || null, end: customRange?.end || null });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const shiftMonth = (delta) => setViewDate(new Date(viewYear, viewMonth + delta, 1));
  const shiftYear = (delta) => setViewDate(new Date(viewYear + delta, viewMonth, 1));
  const shiftDecade = (delta) => setViewDate(new Date(viewYear + delta * 12, viewMonth, 1));

  if (period === "weekly" || period === "custom") {
    const cells = buildMonthGrid(viewYear, viewMonth);
    const selWeekStart = period === "weekly" ? startOfWeek(anchorDate) : null;
    const selWeekEnd = period === "weekly" ? endOfWeek(anchorDate) : null;

    const isInSelectedWeek = (d) => period === "weekly" && d >= selWeekStart && d <= selWeekEnd;
    const isInDraftRange = (d) => {
      if (period !== "custom" || !draftRange.start) return false;
      const end = draftRange.end || draftRange.start;
      const lo = draftRange.start <= end ? draftRange.start : end;
      const hi = draftRange.start <= end ? end : draftRange.start;
      return d >= lo && d <= hi;
    };

    const handleDayClick = (d) => {
      if (period === "weekly") {
        onSelectAnchor(d);
      } else if (!draftRange.start || (draftRange.start && draftRange.end)) {
        setDraftRange({ start: d, end: null });
      } else if (d < draftRange.start) {
        setDraftRange({ start: d, end: draftRange.start });
      } else {
        setDraftRange({ start: draftRange.start, end: d });
      }
    };

    return (
      <div className="picker-pop">
        <div className="picker-nav">
          <button type="button" className="picker-nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            <ChevronLeft size={16} />
          </button>
          <span className="picker-nav-label">{MONTH_LABELS[viewMonth]} {viewYear}</span>
          <button type="button" className="picker-nav-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="picker-weekdays">
          {DAY_LABELS.map((l) => <span key={l}>{l}</span>)}
        </div>
        <div className="picker-grid">
          {cells.map(({ date, inMonth }, idx) => {
            const selected = period === "weekly" ? isInSelectedWeek(date) : isInDraftRange(date);
            const edge = period === "custom" && draftRange.start && (isSameDay(date, draftRange.start) || isSameDay(date, draftRange.end));
            const cls = [
              "picker-day",
              !inMonth ? "muted" : "",
              selected ? "selected" : "",
              edge ? "edge" : "",
              isSameDay(date, new Date()) ? "today" : "",
            ].filter(Boolean).join(" ");
            return (
              <button key={idx} type="button" className={cls} onClick={() => handleDayClick(date)}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
        {period === "custom" && (
          <div className="picker-footer">
            <span className="picker-range-label">
              {draftRange.start ? formatShortDate(draftRange.start) : "Start"} – {draftRange.end ? formatShortDate(draftRange.end) : (draftRange.start ? formatShortDate(draftRange.start) : "End")}
            </span>
            <button
              type="button"
              className="picker-apply-btn"
              disabled={!draftRange.start}
              onClick={() => onSelectCustomRange({ start: draftRange.start, end: draftRange.end || draftRange.start })}
            >
              Apply
            </button>
          </div>
        )}
      </div>
    );
  }

  if (period === "monthly") {
    return (
      <div className="picker-pop">
        <div className="picker-nav">
          <button type="button" className="picker-nav-btn" onClick={() => shiftYear(-1)} aria-label="Previous year">
            <ChevronLeft size={16} />
          </button>
          <span className="picker-nav-label">{viewYear}</span>
          <button type="button" className="picker-nav-btn" onClick={() => shiftYear(1)} aria-label="Next year">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="picker-month-grid">
          {MONTH_SHORT.map((m, idx) => {
            const selected = anchorDate.getFullYear() === viewYear && anchorDate.getMonth() === idx;
            return (
              <button
                key={m}
                type="button"
                className={`picker-month-cell ${selected ? "selected" : ""}`}
                onClick={() => onSelectAnchor(new Date(viewYear, idx, 1))}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // yearly
  const decadeStart = viewYear - (viewYear % 12);
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i);
  return (
    <div className="picker-pop">
      <div className="picker-nav">
        <button type="button" className="picker-nav-btn" onClick={() => shiftDecade(-1)} aria-label="Previous decade">
          <ChevronLeft size={16} />
        </button>
        <span className="picker-nav-label">{decadeStart} – {decadeStart + 11}</span>
        <button type="button" className="picker-nav-btn" onClick={() => shiftDecade(1)} aria-label="Next decade">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="picker-month-grid">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            className={`picker-month-cell ${anchorDate.getFullYear() === y ? "selected" : ""}`}
            onClick={() => onSelectAnchor(new Date(y, 0, 1))}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── main component ───────────────────────── */

export default function AccountingDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const [period, setPeriod] = useState("monthly");
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [customRange, setCustomRange] = useState(() => {
    const today = new Date();
    return { start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerWrapRef = useRef(null);

  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    total_bookings: 0, completed_bookings: 0, cancelled_bookings: 0,
    pending_bookings: 0, gross_revenue: 0, discount: 0, net_revenue: 0,
    amount_received: 0, pending_payment: 0, average_booking: 0, profit: 0, loss: 0,
  });

  // NOTE: param names below (start_date/end_date, month/year, year) are best-guess conventions —
  // confirm they match what the AccountingDashboard / RevenueChart DRF views actually expect.
  const buildDateParams = () => {
    switch (period) {
      case "weekly": {
        const s = startOfWeek(anchorDate);
        const e = endOfWeek(anchorDate);
        return { start_date: toISODate(s), end_date: toISODate(e) };
      }
      case "monthly":
        return { month: anchorDate.getMonth() + 1, year: anchorDate.getFullYear() };
      case "yearly":
        return { year: anchorDate.getFullYear() };
      case "custom":
        return { start_date: toISODate(customRange.start), end_date: toISODate(customRange.end || customRange.start) };
      default:
        return {};
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setChartLoading(true);
    setError(null);
    try {
      const params = { period, ...buildDateParams() };
      const [dashRes, chartRes] = await Promise.all([
        adminApi.getAccountingDashboard(params),
        adminApi.getRevenueChart(params),
      ]);
      setSummary(dashRes?.summary || {});
      setChartData(chartRes?.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Couldn't load accounting data. Try refreshing.");
    } finally {
      setLoading(false);
      setChartLoading(false);
    }
  };

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e) => {
      if (pickerWrapRef.current && !pickerWrapRef.current.contains(e.target)) setPickerOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [period, anchorDate, customRange]);

  const fmt = (val) => (val == null ? "—" : Number(val).toLocaleString("en-IN", { maximumFractionDigits: 0 }));
  const fmtCurrency = (val) => (val == null ? "—" : `₹${fmt(val)}`);
  const fmtAxisCurrency = (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);
  const formatTime = (d) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="acct-root">

        {/* Header */}
        <div className="acct-header">
          <div>
            <div className="acct-title">Accounting Dashboard</div>
            <div className="acct-title-row">
              <span className="acct-title-sub">DQD Gaming · Financial Overview</span>
              <span className="live-pill">
                <span className="live-dot" />
                {lastUpdated ? `Synced ${formatTime(lastUpdated)}` : "Syncing…"}
              </span>
            </div>
          </div>

          <div className="acct-controls">
            <div className="segmented">
              {PERIOD_DEFS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`segmented-btn ${period === p.key ? "active" : ""}`}
                  onClick={() => { setPeriod(p.key); setPickerOpen(false); }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {period !== "daily" && (
              <div className="picker-trigger-wrap" ref={pickerWrapRef}>
                <button type="button" className="picker-trigger" onClick={() => setPickerOpen((o) => !o)}>
                  <CalendarDays size={15} />
                  <span>{getPeriodLabel(period, anchorDate, customRange)}</span>
                </button>
                {pickerOpen && (
                  <PeriodPicker
                    period={period}
                    anchorDate={anchorDate}
                    customRange={customRange}
                    onSelectAnchor={(d) => { setAnchorDate(d); setPickerOpen(false); }}
                    onSelectCustomRange={(r) => { setCustomRange(r); setPickerOpen(false); }}
                  />
                )}
              </div>
            )}

            <button
              type="button"
              className={`cyber-btn icon-btn ${loading ? "spinning" : ""}`}
              onClick={loadAll}
              title="Refresh"
              aria-label="Refresh data"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Hero KPIs */}
        <div className="section-label"><Gamepad2 size={13} /> Key Metrics</div>
        <div className="hero-grid">
          {HERO_DEFS.map(({ key, label, icon: Icon, accent, currency, sub }) => (
            <div key={key} className={`hero-card ${accent}`}>
              <div className="hero-icon-badge" style={{ background: `${theme[accent]}1a`, color: theme[accent] }}>
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <div className="hero-body">
                <div className="hero-label">{label}</div>
                <div className="hero-value">
                  {loading ? <span className="skeleton skeleton-text" /> : (currency ? fmtCurrency(summary[key]) : fmt(summary[key]))}
                </div>
                <div className="hero-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="section-label"><LineChartIcon size={13} /> Revenue Analytics</div>
        <div className="chart-panel">
          <div className="chart-panel-title">Revenue · Bookings · Discounts</div>
          {chartLoading ? (
            <div style={{ height: 360, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Share Tech Mono', monospace", color: theme.cyan, fontSize: "0.8rem", letterSpacing: "0.15em" }}>
              LOADING DATA…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.cyan} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={theme.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={theme.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: theme.muted, fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }} axisLine={{ stroke: theme.border }} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: theme.cyan, fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmtAxisCurrency} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: theme.purple, fontFamily: "'Share Tech Mono', monospace", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.75rem", color: theme.muted }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke={theme.cyan} strokeWidth={2.5} fill="url(#revGradient)" name="Revenue" dot={{ fill: theme.cyan, r: 3 }} activeDot={{ r: 5 }} />
                <Line yAxisId="left" type="monotone" dataKey="discount" stroke={theme.pink} strokeWidth={2} dot={{ fill: theme.pink, r: 3 }} activeDot={{ r: 5 }} name="Discount" />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke={theme.purple} strokeWidth={2.5} dot={{ fill: theme.purple, r: 3 }} activeDot={{ r: 5 }} name="Bookings" />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Detailed Breakdown Table */}
        <div className="section-label"><Receipt size={13} /> Detailed Breakdown</div>
        <div className="table-panel">
          <div className="table-scroll">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th className="num">Value</th>
                </tr>
              </thead>
              <tbody>
                {METRIC_GROUPS.map((group) => (
                  <Fragment key={group.title}>
                    <tr className={`ft-group-row ${group.accent}`}>
                      <td colSpan={2}>
                        <group.icon size={13} />
                        <span>{group.title}</span>
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.key} className="ft-row">
                        <td>
                          <span className="ft-icon-badge" style={{ background: `${theme[row.accent]}1a`, color: theme[row.accent] }}>
                            <row.icon size={14} />
                          </span>
                          {row.label}
                        </td>
                        <td className={`num ${row.tone || ""}`}>
                          {loading ? <span className="skeleton skeleton-text-sm" /> : (row.currency ? fmtCurrency(summary[row.key]) : fmt(summary[row.key]))}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Tiles */}
        <div className="section-label"><BarChart3 size={13} /> Modules</div>
        <div className="nav-grid">
          {NAV_TILES.map(({ label, desc, accent, icon: Icon, path }) => (
            <div key={path} className={`nav-tile ${accent}`} onClick={() => navigate(path)}>
              <div className="nav-tile-icon"><Icon size={26} strokeWidth={1.75} /></div>
              <div className="nav-tile-label">{label}</div>
              <div className="nav-tile-desc">{desc}</div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  );
}