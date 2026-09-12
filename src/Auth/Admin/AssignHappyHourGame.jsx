import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { adminApi } from "../api/adminapi";

const neon = { cyan: "#00f5ff", pink: "#ff2d78", yellow: "#ffe600", bg: "#0a0a0f", card: "#0d0d1a" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

  .ahg-wrap { font-family: 'Share Tech Mono', monospace; background: ${neon.bg}; min-height: 100vh; padding: 2rem; }
  .ahg-title {
    font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 1.6rem;
    color: ${neon.yellow}; text-shadow: 0 0 20px ${neon.yellow}55;
    letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 0.25rem;
  }
  .ahg-subtitle { font-size: 0.65rem; letter-spacing: 0.2em; color: #3a3a5a; margin-bottom: 2rem; text-transform: uppercase; }

  .ahg-panel {
    background: ${neon.card}; border: 1px solid ${neon.yellow}22;
    clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
    max-width: 580px; box-shadow: 0 0 40px ${neon.yellow}08;
  }
  .ahg-panel-header {
    background: linear-gradient(90deg, ${neon.yellow}11 0%, transparent 100%);
    border-bottom: 1px solid ${neon.yellow}22;
    padding: 0.75rem 1.75rem; display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 1.75rem;
  }
  .ahg-panel-dot { width: 6px; height: 6px; border-radius: 50%; background: ${neon.yellow}; box-shadow: 0 0 8px ${neon.yellow}; }
  .ahg-panel-label { font-size: 0.65rem; letter-spacing: 0.25em; color: ${neon.yellow}88; text-transform: uppercase; }

  .ahg-body { padding: 0 1.75rem 2rem; }
  .ahg-field { margin-bottom: 1.5rem; }
  .ahg-label {
    display: block; font-family: 'Orbitron', sans-serif; font-size: 0.6rem;
    font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
    color: ${neon.yellow}88; margin-bottom: 0.5rem;
  }

  .ahg-select {
    width: 100%; background: #0a0a14; border: 1px solid #1a1a3e;
    color: #c8c8e8; font-family: 'Share Tech Mono', monospace; font-size: 0.85rem;
    padding: 0.65rem 0.9rem;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .ahg-select:focus { border-color: ${neon.yellow}88; box-shadow: 0 0 12px ${neon.yellow}22; color: #fff; }
  .ahg-select option { background: #0d0d1a; }

  .ahg-arrow {
    text-align: center; color: #2a2a4a; font-size: 1.25rem; margin: -0.5rem 0 0.5rem;
    letter-spacing: 0.3em;
  }

  .ahg-submit {
    font-family: 'Orbitron', sans-serif; font-size: 0.7rem; font-weight: 700;
    letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; width: 100%;
    background: ${neon.yellow}11; border: 1px solid ${neon.yellow}88; color: ${neon.yellow};
    padding: 0.85rem 2rem; margin-top: 0.5rem;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    transition: box-shadow 0.2s, transform 0.15s;
  }
  .ahg-submit:hover { box-shadow: 0 0 24px ${neon.yellow}44; transform: translateY(-2px); }
  .ahg-submit:disabled { opacity: 0.3; cursor: default; transform: none; }
`;

export default function AssignHappyHourGame() {
  const [slots, setSlots] = useState([]);
  const [games, setGames] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [gameId, setGameId] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const slotData = await adminApi.getHappyHourBookings();
    const gameData = await adminApi.getGames();
    setSlots(slotData || []);
    setGames(gameData || []);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.assignHappyHourGame(slotId, { gaming_item: gameId });
      alert("Game Assigned Successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <style>{styles}</style>
      <div className="ahg-wrap">
        <h3 className="ahg-title">Assign Game</h3>
        <p className="ahg-subtitle">// Happy hour · game binding</p>

        <div className="ahg-panel">
          <div className="ahg-panel-header">
            <div className="ahg-panel-dot" />
            <span className="ahg-panel-label">Game Assignment</span>
          </div>

          <form onSubmit={submit} className="ahg-body">
            <div className="ahg-field">
              <label className="ahg-label">Happy Hour Booking</label>
              <select className="ahg-select" value={slotId} onChange={(e) => setSlotId(e.target.value)} required>
                <option value="">— Select Booking —</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.happy_hour_slot}>{slot.user_name}</option>
                ))}
              </select>
            </div>

            <div className="ahg-arrow">⟶</div>

            <div className="ahg-field">
              <label className="ahg-label">Gaming Item</label>
              <select className="ahg-select" value={gameId} onChange={(e) => setGameId(e.target.value)} required>
                <option value="">— Select Game —</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="ahg-submit" disabled={!slotId || !gameId}>
              Assign Game →
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}