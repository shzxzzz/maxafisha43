import { IValidationMessage } from './types';

const messages: IValidationMessage[] = [];

export const addError = (msgPath: string, message: string, details?: string): void => {
  messages.push({ level: 'error', path: msgPath, message, details });
};

export const addWarning = (msgPath: string, message: string, details?: string): void => {
  messages.push({ level: 'warning', path: msgPath, message, details });
};

export const getMessages = (): IValidationMessage[] => messages;
