export type TMyTrackerEntry = {
  id?: string;
  type: 'pageView' | 'reachGoal' | 'setUserID' | 'deleteUserID' | 'onready';
  userid?: string;
  goal?: string;
  url?: string;
  start?: number;
  params?: Record<string, unknown>;
  callback?: () => void;
};

declare global {
  interface Window {
    _tmr: TMyTrackerEntry[];
  }
}
