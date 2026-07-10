import { TChipsTrackVariant } from './types';

export const modeByVariant: Record<TChipsTrackVariant, 'secondary' | 'tertiary'> = {
  primary: 'secondary',
  secondary: 'tertiary',
};
