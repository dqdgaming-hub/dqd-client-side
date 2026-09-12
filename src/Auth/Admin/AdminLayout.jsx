import AdminFooter from "./AdminFooter";
import AdminNavbar from "./AdminNavbar";

const css = `
  .adm-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #05050f;
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background — matches AuthForm's radial glows */
  .adm-shell::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(ellipse 60% 40% at 10% 10%, rgba(0, 255, 225, 0.04) 0%, transparent 60%),
      radial-gradient(ellipse 50% 35% at 90% 85%, rgba(255, 0, 110, 0.05) 0%, transparent 55%),
      radial-gradient(ellipse 30% 20% at 55% 5%,  rgba(245, 255, 0, 0.025) 0%, transparent 50%);
  }

  /* Subtle grid overlay */
  .adm-shell::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background-image:
      linear-gradient(rgba(0, 255, 225, 0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 225, 0.018) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  .adm-main {
    flex: 1;
    position: relative;
    z-index: 1;
    padding: 32px 28px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    .adm-main { padding: 20px 16px; }
  }
  @media (max-width: 480px) {
    .adm-main { padding: 16px 12px; }
  }
`;

export default function AdminLayout({ children }) {
  return (
    <>
      <style>{css}</style>
      <div className="adm-shell">
        <AdminNavbar />
        <main className="adm-main">{children}</main>
        <AdminFooter />
      </div>
    </>
  );
}