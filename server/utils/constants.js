export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

export const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
});

export const THEME = Object.freeze(['light', 'dark', 'system']);
export const FONT_SIZE = Object.freeze(['sm', 'md', 'lg']);
export const CONTENT_DENSITY = Object.freeze(['compact', 'comfortable']);

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 40;
export const BIO_MAX_LENGTH = 200;

export const DELETED_USER_LABEL = 'Deleted User';

export const CONVERSATION_TYPES = Object.freeze({
  DIRECT: 'direct',
  GROUP: 'group',
});

export const MESSAGE_TYPES = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system',
});

export const MESSAGE_DELETED_FOR = Object.freeze({
  NONE: 'none',
  SELF: 'self',
  EVERYONE: 'everyone',
});

export const MESSAGE_TEXT_MAX_LENGTH = 4000;
// Enough for one emoji, including ZWJ sequences.
export const REACTION_EMOJI_MAX_LENGTH = 4;
export const MESSAGE_EDIT_WINDOW_MS = 15 * 60 * 1000;
export const MESSAGE_DELETE_FOR_EVERYONE_WINDOW_MS = 5 * 60 * 1000;

export const GROUP_NAME_MAX_LENGTH = 50;
export const GROUP_MIN_PARTICIPANTS = 2;
export const GROUP_MAX_PARTICIPANTS = 100;
export const DIRECT_PARTICIPANTS = 2;

export const NOTIFICATION_TYPES = Object.freeze({
  MESSAGE: 'message',
  MENTION: 'mention',
  GROUP_INVITE: 'groupInvite',
  ADMIN_ACTION: 'adminAction',
});

export const NOTIFICATION_TEXT_MAX_LENGTH = 200;

// Messages in the same chat within this window update one notification instead of stacking.
export const NOTIFICATION_COLLAPSE_WINDOW_MS = 30 * 1000;

export const REPORT_TARGET_TYPES = Object.freeze({
  USER: 'user',
  MESSAGE: 'message',
  CONVERSATION: 'conversation',
});

export const REPORT_REASONS = Object.freeze({
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  INAPPROPRIATE: 'inappropriate',
  OTHER: 'other',
});

export const REPORT_STATUSES = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  DISMISSED: 'dismissed',
  ACTION_TAKEN: 'actionTaken',
});

export const REPORT_DESCRIPTION_MAX_LENGTH = 500;
export const REPORT_REVIEW_NOTE_MAX_LENGTH = 500;

// A reporter can't report the same target again within this window.
export const REPORT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const ADMIN_AUDIT_ACTIONS = Object.freeze({
  USER_SUSPEND: 'user.suspend',
  USER_REINSTATE: 'user.reinstate',
  USER_ROLE_CHANGE: 'user.roleChange',
  USER_DELETE: 'user.delete',
  MESSAGE_FORCE_DELETE: 'message.forceDelete',
  CONVERSATION_VIEW: 'conversation.view',
  REPORT_REVIEW: 'report.review',
});
