export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const COLORS = {
  PRIMARY: '#2563EB',
  SECONDARY: '#64748B',
  BACKGROUND: '#F8FAFC',
  SURFACE: '#FFFFFF',
  BORDER: '#E2E8F0',
  TEXT: {
    PRIMARY: '#1E293B',
    SECONDARY: '#64748B',
    TERTIARY: '#94A3B8',
    INVERSE: '#FFFFFF',
  },
  STATUS: {
    SUCCESS: '#22C55E',
    ERROR: '#EF4444',
    WARNING: '#F59E0B',
    INFO: '#3B82F6',
  },
};

export const APP_CONFIG = {
  MODEL_STORAGE_KEY: '@local_ai_chat/models',
  CHAT_STORAGE_KEY: '@local_ai_chat/chats',
  MAX_CONTEXT_LENGTH: 2048,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_RESPONSE_TOKENS: 1000,
};
