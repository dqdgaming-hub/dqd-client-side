export const theme = {
  void: "#05040A",
  panel: "#0C0A14",
  panelAlt: "#120E1C",
  border: "rgba(122,44,255,0.22)",
  borderBright: "rgba(63,224,197,0.35)",
  purple: "#7A2CFF",
  purpleGlow: "rgba(122,44,255,0.55)",
  teal: "#3FE0C5",
  tealGlow: "rgba(63,224,197,0.45)",
  gold: "#D4AF37",
  goldGlow: "rgba(212,175,55,0.4)",
  danger: "#E63950",
  dangerGlow: "rgba(230,57,80,0.4)",
  text: "#F4F1FA",
  textDim: "#8A8598",
  textFaint: "#5B5668",
};

export const fonts = {
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  mono: "'Share Tech Mono', monospace",
};

export const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
`;

// chamfered corner clip-paths
export const chamfer = {
  sm: "polygon(0% 12%, 12% 0%, 100% 0%, 100% 88%, 88% 100%, 0% 100%)",
  md: "polygon(0% 8%, 8% 0%, 100% 0%, 100% 92%, 92% 100%, 0% 100%)",
  lg: "polygon(0% 6%, 6% 0%, 94% 0%, 100% 6%, 100% 94%, 94% 100%, 6% 100%, 0% 94%)",
  card: "polygon(0% 4%, 4% 0%, 96% 0%, 100% 4%, 100% 96%, 96% 100%, 4% 100%, 0% 96%)",
};

export const statusTheme = {
  pending: { color: theme.gold, glow: theme.goldGlow, label: "PENDING" },
  approved: { color: theme.teal, glow: theme.tealGlow, label: "CONFIRMED" },
  attended: { color: "#5B8DFF", glow: "rgba(91,141,255,0.4)", label: "ATTENDED" },
  rejected: { color: theme.danger, glow: theme.dangerGlow, label: "REJECTED" },
  cancelled: { color: theme.textFaint, glow: "rgba(91,86,104,0.3)", label: "CANCELLED" },
};