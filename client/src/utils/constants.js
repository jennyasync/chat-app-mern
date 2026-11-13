export const STORAGE_KEYS = Object.freeze({
  TOKEN: 'token',
  GUEST_PREFERENCES: 'guestPreferences',
});

export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
});

// Same as the server defaults so the theme doesn't flash between guest and signed-in states.
export const DEFAULT_PREFERENCES = Object.freeze({
  theme: 'system',
  fontSize: 'md',
  contentDensity: 'comfortable',
  animations: true,
  enterToSend: true,
  showReadReceipts: true,
  showOnlineStatus: true,
  notifications: {
    browser: true,
    sound: true,
    muteAll: false,
  },
});

// The rules below mirror server/utils/constants.js. They are for form feedback only;
// the server validates everything again.
export const AUTH_RULES = Object.freeze({
  USERNAME_REGEX: /^[a-zA-Z0-9_]+$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  DISPLAY_NAME_MIN_LENGTH: 2,
  DISPLAY_NAME_MAX_LENGTH: 40,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_COMPLEXITY: /^(?=.*[A-Za-z])(?=.*\d).+$/,
});

export const PROFILE_RULES = Object.freeze({
  BIO_MAX_LENGTH: 200,
  AVATAR_MAX_SIZE_MB: 5,
});

// value must match the server REPORT_REASONS enum or POST /reports returns 422.
export const REPORT_REASONS = Object.freeze([
  { value: 'spam', label: 'Spam or scam' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Something else' },
]);

export const REPORT_DETAILS_MAX_LENGTH = 500;

export const GROUP_RULES = Object.freeze({
  NAME_MAX_LENGTH: 50,
  MAX_PARTICIPANTS: 100,
  AVATAR_MAX_SIZE_MB: 5,
});

export const NOTIFICATION_SOUND_URL = '/notification-sound.mp3';

// How many notifications NotificationContext keeps in memory; the full list stays on the server.
export const NOTIFICATION_BUFFER_SIZE = 20;
