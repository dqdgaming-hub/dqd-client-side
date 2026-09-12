import { useNavigate } from "react-router-dom";
import { authApi } from "../api/client";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate("/sign-in", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const css = `
    .logout-btn {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 9px;
      padding: 11px 18px; border-radius: 10px; border: none;
      background: linear-gradient(135deg, rgba(220,38,38,0.14) 0%, rgba(159,18,57,0.18) 100%);
      border: 1px solid rgba(239,68,68,0.22);
      color: #fca5a5; font-size: .83rem; font-weight: 600;
      font-family: 'Rajdhani', 'Inter', sans-serif; letter-spacing: .06em;
      text-transform: uppercase; cursor: pointer;
      position: relative; overflow: hidden;
      transition: background .22s, border-color .22s, color .22s, box-shadow .22s;
    }
    .logout-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(239,68,68,0.22), rgba(220,38,38,0.28));
      opacity: 0; transition: opacity .22s;
    }
    .logout-btn:hover {
      border-color: rgba(239,68,68,0.48);
      color: #fff;
      box-shadow: 0 0 20px rgba(239,68,68,0.22), 0 4px 14px rgba(0,0,0,0.4);
    }
    .logout-btn:hover::before { opacity: 1; }
    .logout-btn:active { transform: scale(.98); }
    .logout-icon {
      position: relative; z-index: 1;
      width: 18px; height: 18px;
      display: flex; align-items: center; justify-content: center;
    }
    .logout-label { position: relative; z-index: 1; }
  `;

  return (
    <>
      <style>{css}</style>
      <button className="logout-btn" onClick={handleLogout} type="button">
        <span className="logout-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </span>
        <span className="logout-label">Logout</span>
      </button>
    </>
  );
}