import { Icon24WarningTriangleOutline } from '@vkontakte/icons';
import * as React from 'react';

export type TIconsPropsType = React.SVGProps<SVGSVGElement> & {
  fill?: string;
  width?: number;
  height?: number;
  getRootRef?: React.Ref<SVGSVGElement>;
  title?: string;
  deprecated?: boolean;
  replacement?: string;
};

export enum ESnackbarGoalsEnum {
  success = 'success',
  error = 'error',
  info = 'info',
}

/**
 * Тип содержит в себе текст (text) и цель (goal) сообщения. Если цели сообщения нет,
 * в снекбаре не будет отображена иконка перед текстом
 */
export type TSnackbarMessageType = {
  text: React.ReactNode;
  goal?: ESnackbarGoalsEnum;
  duration?: number;
  icon?: React.ReactNode;
};

export const SNACKBAR_MESSAGES_CONFIG: Record<ESnackbarGoalsEnum, TSnackbarMessageType> = {
  [ESnackbarGoalsEnum.error]: {
    text: 'Произошла ошибка',
    goal: ESnackbarGoalsEnum.error,
    icon: <Icon24WarningTriangleOutline />,
  },
  [ESnackbarGoalsEnum.success]: {
    text: 'Действие успешно выполнено',
    goal: ESnackbarGoalsEnum.success,
  },
  [ESnackbarGoalsEnum.info]: {
    text: 'Что-то пошло не так',
    goal: ESnackbarGoalsEnum.info,
  },
};
