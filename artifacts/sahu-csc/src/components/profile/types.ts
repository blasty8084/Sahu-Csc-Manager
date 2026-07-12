export interface SessionEntry {
  id: number;
  sessionId: string;
  deviceInfo: string;
  browser: string;
  os: string;
  ipAddress: string;
  rememberMe: boolean;
  isCurrent: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}
