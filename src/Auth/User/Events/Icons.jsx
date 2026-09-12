// Minimal, consistent line-icon set — no emojis, ever.
export const CalendarIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M3 9.5H21" stroke={color} strokeWidth="1.6" />
    <path d="M8 3V6.5M16 3V6.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="13.5" r="1" fill={color} />
    <circle cx="12" cy="13.5" r="1" fill={color} />
  </svg>
);

export const ClockIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <path d="M12 7V12L15.2 14" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CoinIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <path d="M12 7.5V16.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M14.6 9.8C14.2 9 13.3 8.5 12.2 8.5C10.8 8.5 9.8 9.2 9.8 10.2C9.8 12.4 14.4 11.3 14.4 13.7C14.4 14.8 13.3 15.5 11.9 15.5C10.7 15.5 9.7 15 9.3 14.2"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const TicketIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 9.5C4.1 9.5 5 8.6 5 7.5C5 6.4 4.1 5.5 3 5.5V5C3 4.4 3.4 4 4 4H20C20.6 4 21 4.4 21 5V5.5C19.9 5.5 19 6.4 19 7.5C19 8.6 19.9 9.5 21 9.5V10C21 10.6 20.6 11 20 11H4C3.4 11 3 10.6 3 10V9.5Z"
      stroke={color} strokeWidth="1.5" strokeLinejoin="round" transform="translate(0,7)" />
    <path d="M9 4L9 20" stroke={color} strokeWidth="1.4" strokeDasharray="2.5 2.5" />
  </svg>
);

export const UsersIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.6" />
    <path d="M3.5 20C3.5 16.5 6 14.5 9 14.5C12 14.5 14.5 16.5 14.5 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M15.5 8.5C16.9 8.5 18 7.4 18 6C18 4.6 16.9 3.5 15.5 3.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16.5 14.7C18.9 15.1 20.5 16.8 20.5 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const CloseIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 5L19 19M19 5L5 19" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const CheckIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
    <path d="M8 12.5L10.7 15L16 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AlertIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L21.5 20H2.5L12 3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M12 10V14.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="17.3" r="1" fill={color} />
  </svg>
);

export const ArrowLeftIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const StarIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L14.5 9.2L21 9.8L16 14.2L17.5 20.8L12 17.2L6.5 20.8L8 14.2L3 9.8L9.5 9.2L12 3Z"
      stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

export const QRIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" stroke={color} strokeWidth="1.6" />
    <rect x="14" y="3" width="7" height="7" stroke={color} strokeWidth="1.6" />
    <rect x="3" y="14" width="7" height="7" stroke={color} strokeWidth="1.6" />
    <rect x="5.5" y="5.5" width="2" height="2" fill={color} />
    <rect x="16.5" y="5.5" width="2" height="2" fill={color} />
    <rect x="5.5" y="16.5" width="2" height="2" fill={color} />
    <path d="M14 14H17V17H14V14Z" stroke={color} strokeWidth="1.5" />
    <path d="M19 14H21V16H19V14Z" fill={color} />
    <path d="M14 19H16V21H14V19Z" fill={color} />
    <path d="M18 18.5H21V21H18V18.5Z" stroke={color} strokeWidth="1.4" />
  </svg>
);

export const SeatIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 12V6.5C6 5.1 7.1 4 8.5 4H15.5C16.9 4 18 5.1 18 6.5V12" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M5 12H19V16.5C19 17.3 18.3 18 17.5 18H6.5C5.7 18 5 17.3 5 16.5V12Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M6 18V20M18 18V20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const ShieldIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3L19 6V11C19 16 16 19.5 12 21C8 19.5 5 16 5 11V6L12 3Z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);