export interface IAppParamsStore {
  search: string;
  locationHash: string;
  isProd: boolean;
  isDev: boolean;
  isMobile: boolean;
  isLocalDev: boolean;
  initData: string | null;
  setInitData: (initData: string) => void;

  chatId: string | null;
  chatIdFromInitData: string | null;
  chatIdFromStartParam: string | null;
  chatTypeFromStartParams: string | null;
  isGroupChat: boolean;
}
