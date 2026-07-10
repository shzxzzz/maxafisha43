import { TServiceType } from 'types/config';

export const openService = (type: TServiceType, link: string): void => {
  switch (type) {
    case 'chatbot':
    case 'miniApp':
    case 'channel':
      WebApp.openMaxLink(link);
      break;
    case 'site':
    case 'form':
      WebApp.openLink(link);
      break;
  }
};
