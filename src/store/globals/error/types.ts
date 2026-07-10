export enum EErrorType {
  ANALYTICS = 'analytics',
  RENDER = 'render',
  ROUTER = 'router',
}

export type TCommonErrorData = Record<string, string | number | boolean>;
