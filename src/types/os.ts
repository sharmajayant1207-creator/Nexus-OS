export enum SystemState {
  BOOTING = 'BOOTING',
  LOGIN = 'LOGIN',
  DESKTOP = 'DESKTOP',
  LOCKED = 'LOCKED',
  SLEEP = 'SLEEP',
  REBOOTING = 'REBOOTING',
  SHUTDOWN = 'SHUTDOWN',
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  pin: string;
  role: string;
  email: string;
}

export interface OSNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  app?: string;
  iconName?: string;
  read: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface Wallpaper {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  type: 'abstract' | 'cyberpunk' | 'minimal' | 'nature' | 'space';
}

export interface SystemLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error';
}
