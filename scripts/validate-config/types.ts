export interface IValidationMessage {
  level: 'error' | 'warning';
  path: string;
  message: string;
  details?: string;
}
