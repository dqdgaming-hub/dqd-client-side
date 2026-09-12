import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getUserBookingsWallet, cancelUserBooking } from "../../../api/userapi";
import BookingTabs from "../components/BookingTabs";
import UpcomingBookings from "../components/UpcomingBookings";
import BookingHistory from "../components/BookingHistory";
import BookingDetailsModal from "../components/BookingDetailsModal";
import CancelBookingModal from "../components/CancelBookingModal";
import EmptyBookings from "../components/EmptyBookings";
import UserLayout from "../../Userlayout";

const bookingWalletStyles = `
.dqd-wallet {
  --gold: #D4AF37;
  --purple: #7A2CFF;
  --silver: #B9C2D9;
  --void: #05040A;
  --void-2: #0D0A18;
  --danger: #FF4D6D;
  --teal: #3FE0C5;

  position: relative;
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 48px 0 80px;
  color: var(--silver);
  font-family: 'Rajdhani', sans-serif;
}

.dqd-wallet * {
  box-sizing: border-box;
}

/* ---------- header ---------- */

.dqd-wallet__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.dqd-wallet__eyebrow {
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gold);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.dqd-wallet__eyebrow::before {
  content: "";
  width: 22px;
  height: 1px;
  background: var(--gold);
}

.dqd-wallet h1 {
  margin: 0;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(1.9rem, 4.4vw, 3.2rem);
  line-height: 1;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 10%, var(--gold) 60%, var(--purple) 110%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.01em;
}

.dqd-wallet__counts {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dqd-wallet__counts span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  background: rgba(212, 175, 55, 0.06);
  padding: 9px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gold);
}

/* ---------- tabs ---------- */

.dqd-tabs {
  position: relative;
  display: inline-flex;
  gap: 4px;
  padding: 5px;
  margin-bottom: 28px;
  border: 1px solid rgba(185, 194, 217, 0.16);
  background: rgba(13, 10, 24, 0.6);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

.dqd-tabs__btn {
  position: relative;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  border-radius: 0;
  z-index: 1;
}

.dqd-tabs__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-family: 'Rajdhani', sans-serif;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--silver);
  letter-spacing: 0.02em;
  transition: color 0.25s ease;
}

.dqd-tabs__btn.is-active .dqd-tabs__content {
  color: #05040A;
}

.dqd-tabs__content em {
  font-style: normal;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.75rem;
  background: rgba(185, 194, 217, 0.14);
  padding: 1px 7px;
  border-radius: 999px;
}

.dqd-tabs__btn.is-active .dqd-tabs__content em {
  background: rgba(5, 4, 10, 0.18);
}

.dqd-tabs__pill {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--gold), #e8c766);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  z-index: 1;
}

/* ---------- grid ---------- */

.dqd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.dqd-grid--history {
  opacity: 0.92;
}

/* ---------- card ---------- */

.dqd-card {
  position: relative;
  background: linear-gradient(165deg, rgba(13, 10, 24, 0.92), rgba(5, 4, 10, 0.96));
  border: 1px solid rgba(185, 194, 217, 0.14);
  clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.dqd-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: 0 18px 50px rgba(122, 44, 255, 0.22), 0 0 0 1px rgba(212, 175, 55, 0.08) inset;
}

.dqd-card__spotlight {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(420px circle at 50% -10%, rgba(212, 175, 55, 0.16), transparent 60%);
}

.dqd-card__actions {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid rgba(185, 194, 217, 0.1);
}

/* ---------- buttons ---------- */

.dqd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 42px;
  flex: 1;
  border: 1px solid transparent;
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  padding: 0 14px;
  font-family: 'Rajdhani', sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  cursor: pointer;
  background: linear-gradient(135deg, var(--purple), #5b1ad1);
  color: #fff;
  transition: filter 0.2s ease;
}

.dqd-btn:hover {
  filter: brightness(1.15);
}

.dqd-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dqd-btn--ghost {
  background: rgba(185, 194, 217, 0.06);
  border-color: rgba(185, 194, 217, 0.25);
  color: var(--silver);
}

.dqd-btn--danger {
  background: linear-gradient(135deg, var(--danger), #c91b3a);
}

.dqd-btn--block {
  width: 100%;
  margin-top: 18px;
}

/* ---------- ticket ---------- */

.dqd-ticket {
  position: relative;
  overflow: visible;
  isolation: isolate;
}

.dqd-ticket__notch {
  position: absolute;
  left: calc(72% - 11px);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--void);
  z-index: 3;
}

.dqd-card .dqd-ticket__notch {
  background: #0a0712;
}

.dqd-ticket__notch--top {
  top: -11px;
}

.dqd-ticket__notch--bottom {
  bottom: -11px;
}

@media (max-width: 720px) {
  .dqd-ticket__notch {
    display: none;
  }
}

.dqd-ticket-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(90deg, rgba(122, 44, 255, 0.22), rgba(212, 175, 55, 0.12));
  border-bottom: 1px dashed rgba(212, 175, 55, 0.3);
  overflow: hidden;
}

.dqd-ticket-header__bulbs {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  padding: 3px 10px;
  pointer-events: none;
}

.dqd-ticket-header__bulbs i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 4px var(--gold);
  align-self: flex-start;
}

.dqd-ticket-header__bulbs i:nth-child(even) {
  align-self: flex-end;
}

.dqd-ticket-header__kind {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--gold);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dqd-ticket-header__id {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.76rem;
  color: var(--silver);
  opacity: 0.8;
}

.dqd-ticket__body {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: stretch;
  gap: 0;
  padding: 18px;
}

.dqd-ticket__details {
  padding-right: 18px;
}

.dqd-ticket__tear {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 0;
}

.dqd-ticket__tear-line {
  position: absolute;
  top: -18px;
  bottom: -18px;
  left: 0;
  width: 0;
  border-left: 2px dashed rgba(212, 175, 55, 0.35);
}

.dqd-ticket__tear-icon {
  position: relative;
  color: var(--gold);
  background: inherit;
  z-index: 1;
}

.dqd-ticket__stub {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-left: 18px;
  min-width: 130px;
}

.dqd-ticket__admit {
  margin: 2px 0 0;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--gold);
  opacity: 0.8;
  writing-mode: horizontal-tb;
  text-align: center;
}

.dqd-ticket__details h2 {
  margin: 12px 0 16px;
  font-family: 'Orbitron', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.01em;
}

.dqd-ticket__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 0;
}

.dqd-ticket__grid dt {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--silver);
  opacity: 0.65;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dqd-ticket__grid dd {
  margin: 4px 0 0;
  font-weight: 800;
  font-size: 0.96rem;
  color: #fff;
  font-family: 'Share Tech Mono', monospace;
}

.dqd-ticket__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.dqd-ticket__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 16px 14px;
  border-top: 1px dashed rgba(212, 175, 55, 0.25);
}

.dqd-barcode {
  width: 140px;
  height: 22px;
  color: rgba(185, 194, 217, 0.65);
  flex-shrink: 0;
}

.dqd-ticket__footer-id {
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--silver);
  opacity: 0.5;
  white-space: nowrap;
}

/* ---------- status / chips ---------- */

.dqd-status {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid color-mix(in srgb, var(--status-color) 50%, transparent);
  background: color-mix(in srgb, var(--status-color) 12%, transparent);
  color: var(--status-color);
  clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  padding: 5px 11px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.dqd-status__pulse {
  position: absolute;
  left: 11px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--status-color);
  pointer-events: none;
}

.dqd-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.dqd-chip--payment {
  border: 1px solid color-mix(in srgb, var(--chip-color) 45%, transparent);
  background: color-mix(in srgb, var(--chip-color) 10%, transparent);
  color: var(--chip-color);
}

.dqd-chip--loyalty {
  border: 1px solid rgba(212, 175, 55, 0.4);
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold);
}

/* ---------- countdown ---------- */

.dqd-countdown {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 16px;
  color: var(--teal);
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.82rem;
  font-weight: 700;
}

.dqd-countdown--urgent {
  color: var(--danger);
}

.dqd-countdown__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ---------- QR ---------- */

.dqd-qr {
  display: grid;
  gap: 10px;
  justify-items: center;
  align-content: start;
  min-width: 122px;
}

.dqd-qr__frame {
  position: relative;
  width: 112px;
  height: 112px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  background: rgba(5, 4, 10, 0.5);
  overflow: hidden;
}

.dqd-qr__frame img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.dqd-qr__placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--gold);
  opacity: 0.6;
}

.dqd-qr__corner {
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: var(--gold);
  border-style: solid;
  z-index: 2;
}

.dqd-qr__corner--tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
.dqd-qr__corner--tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; }
.dqd-qr__corner--bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; }
.dqd-qr__corner--br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

.dqd-qr__scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--teal), transparent);
  box-shadow: 0 0 8px var(--teal);
}

.dqd-qr__sweep {
  position: absolute;
  inset: -30%;
  z-index: 0;
  pointer-events: none;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(212, 175, 55, 0.22) 18deg, transparent 40deg);
}

.dqd-qr__meta {
  text-align: center;
}

.dqd-qr__meta p {
  margin: 0 0 4px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 0.68rem;
  color: var(--silver);
  opacity: 0.75;
  word-break: break-all;
}

.dqd-qr__meta span {
  display: block;
  color: #fff;
  font-weight: 700;
}

/* ---------- modal ---------- */

.dqd-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(5, 4, 10, 0.78);
  backdrop-filter: blur(6px);
}

.dqd-modal__panel {
  position: relative;
  width: min(760px, 100%);
  max-height: min(90vh, 900px);
  overflow: auto;
  padding: 20px;
  background: linear-gradient(165deg, rgba(13, 10, 24, 0.97), rgba(5, 4, 10, 0.99));
  border: 1px solid rgba(212, 175, 55, 0.25);
  clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
}

.dqd-modal__panel--small {
  width: min(460px, 100%);
  text-align: center;
}

.dqd-modal__panel h2 {
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  margin: 4px 0 10px;
}

.dqd-modal__panel--small p {
  color: var(--silver);
  opacity: 0.85;
  line-height: 1.5;
}

.dqd-modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(185, 194, 217, 0.25);
  background: rgba(185, 194, 217, 0.08);
  color: var(--silver);
  cursor: pointer;
  border-radius: 50%;
  z-index: 5;
}

.dqd-modal__close:hover {
  color: var(--gold);
  border-color: var(--gold);
}

.dqd-modal__icon-warn {
  width: 56px;
  height: 56px;
  margin: 0 auto 6px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 77, 109, 0.12);
  color: var(--danger);
}

.dqd-modal textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid rgba(185, 194, 217, 0.22);
  background: rgba(5, 4, 10, 0.5);
  color: #fff;
  padding: 12px;
  font: inherit;
  margin-top: 14px;
}

.dqd-modal textarea:focus {
  outline: none;
  border-color: var(--gold);
}

.dqd-modal__actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

.dqd-modal__notes {
  margin-top: 18px;
  padding: 14px 16px;
  border: 1px solid rgba(185, 194, 217, 0.14);
  background: rgba(185, 194, 217, 0.04);
}

.dqd-modal__notes h3 {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
  font-size: 0.9rem;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dqd-modal__notes p {
  margin: 0;
  color: var(--silver);
  line-height: 1.5;
}

.dqd-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
}

/* ---------- members ---------- */

.dqd-members {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid rgba(185, 194, 217, 0.14);
  background: rgba(185, 194, 217, 0.04);
}

.dqd-members h3 {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dqd-members ul {
  display: grid;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
}

.dqd-members li {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid rgba(185, 194, 217, 0.1);
  color: #fff;
  font-weight: 600;
}

.dqd-members li small {
  color: var(--silver);
  opacity: 0.7;
  font-family: 'Share Tech Mono', monospace;
  font-weight: 400;
}

/* ---------- empty state ---------- */

.dqd-empty {
  position: relative;
  text-align: center;
  padding: 64px 24px;
  border: 1px dashed rgba(185, 194, 217, 0.2);
  background: rgba(13, 10, 24, 0.4);
  overflow: hidden;
}

.dqd-empty__beam {
  position: absolute;
  top: -40%;
  left: 50%;
  width: 2px;
  height: 60%;
  transform: translateX(-50%) scaleX(1);
  background: linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.5));
  clip-path: polygon(48% 0, 52% 0, 100% 100%, 0% 100%);
  filter: blur(1px);
  pointer-events: none;
}

.dqd-empty__icon {
  color: var(--gold);
  opacity: 0.7;
  margin-bottom: 14px;
}

.dqd-empty h2 {
  font-family: 'Orbitron', sans-serif;
  color: #fff;
  margin: 0 0 8px;
  font-size: 1.3rem;
}

.dqd-empty p {
  margin: 0;
  color: var(--silver);
  opacity: 0.7;
}

/* ---------- error / loading ---------- */

.dqd-wallet__error {
  padding: 14px 16px;
  border: 1px solid rgba(255, 77, 109, 0.35);
  background: rgba(255, 77, 109, 0.08);
  color: var(--danger);
  font-weight: 700;
  margin-bottom: 20px;
}

.dqd-wallet__loading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: var(--gold);
  font-family: 'Share Tech Mono', monospace;
  letter-spacing: 0.05em;
}

.dqd-wallet__loading-bar {
  flex: 1;
  height: 2px;
  background: rgba(212, 175, 55, 0.15);
  position: relative;
  overflow: hidden;
}

.dqd-wallet__loading-bar::after {
  content: "";
  position: absolute;
  inset: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  animation: dqd-loading-sweep 1.3s ease-in-out infinite;
}

@keyframes dqd-loading-sweep {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
}

/* ---------- responsive ---------- */

@media (max-width: 720px) {
  .dqd-wallet {
    width: min(100% - 20px, 1180px);
    padding: 28px 0 60px;
  }

  .dqd-wallet__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .dqd-grid {
    grid-template-columns: 1fr;
  }

  .dqd-ticket__body {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .dqd-ticket__details {
    padding-right: 0;
  }

  .dqd-ticket__tear {
    width: 100%;
    height: 0;
    margin: 4px 0;
  }

  .dqd-ticket__tear-line {
    top: 0;
    bottom: 0;
    left: -18px;
    right: -18px;
    width: auto;
    border-left: none;
    border-top: 2px dashed rgba(212, 175, 55, 0.35);
  }

  .dqd-ticket__tear-icon {
    transform: rotate(90deg);
  }

  .dqd-ticket__stub {
    flex-direction: row;
    padding-left: 0;
    justify-content: flex-start;
    min-width: 0;
  }

  .dqd-ticket__admit {
    writing-mode: vertical-rl;
  }

  .dqd-ticket__grid {
    grid-template-columns: 1fr 1fr;
  }

  .dqd-qr {
    justify-self: start;
    justify-items: start;
    flex-direction: row;
  }

  .dqd-qr__meta {
    text-align: left;
  }

  .dqd-card__actions {
    flex-direction: column;
  }

  .dqd-modal__actions {
    flex-direction: column-reverse;
  }

  .dqd-tabs {
    width: 100%;
  }

  .dqd-tabs__btn {
    flex: 1;
  }

  .dqd-tabs__content {
    justify-content: center;
  }
}
`;

const Bookings = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [wallet, setWallet] = useState({ upcoming: [], history: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const bookings = useMemo(
    () => (activeTab === "upcoming" ? wallet.upcoming : wallet.history),
    [activeTab, wallet]
  );

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getUserBookingsWallet();
      setWallet({
        upcoming: data.upcoming || [],
        history: data.history || [],
        counts: data.counts || {},
      });
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (reason) => {
    if (!cancelBooking) return;
    try {
      setCancelLoading(true);
      await cancelUserBooking(cancelBooking.booking_id, reason);
      setCancelBooking(null);
      await loadBookings();
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <UserLayout>
      <style>{bookingWalletStyles}</style>
      <main className="dqd-wallet">
        <motion.header
          className="dqd-wallet__header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="dqd-wallet__eyebrow">Ticket Wallet</p>
            <h1>My Bookings</h1>
          </div>
          <div className="dqd-wallet__counts">
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7V12L15.5 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              {wallet.counts?.upcoming || 0} Upcoming
            </span>
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 4H19V18L15 22V4H5V20L9 16H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              {wallet.counts?.history || 0} Past
            </span>
          </div>
        </motion.header>

        <BookingTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          upcomingCount={wallet.counts?.upcoming || 0}
          historyCount={wallet.counts?.history || 0}
        />

        {error && (
          <motion.div
            className="dqd-wallet__error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {loading ? (
          <div className="dqd-wallet__loading">
            Loading tickets
            <div className="dqd-wallet__loading-bar" />
          </div>
        ) : bookings.length ? (
          activeTab === "upcoming" ? (
            <UpcomingBookings
              bookings={bookings}
              onView={setSelectedBooking}
              onCancel={setCancelBooking}
            />
          ) : (
            <BookingHistory bookings={bookings} onView={setSelectedBooking} />
          )
        ) : (
          <EmptyBookings type={activeTab} />
        )}

        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={setCancelBooking}
        />

        <CancelBookingModal
          booking={cancelBooking}
          loading={cancelLoading}
          onClose={() => setCancelBooking(null)}
          onConfirm={handleCancel}
        />
      </main>
    </UserLayout>
  );
};

export default Bookings;