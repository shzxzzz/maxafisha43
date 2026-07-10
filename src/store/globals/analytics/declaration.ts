import { TAnalyticsPage } from './types';

export interface IAnalyticsStore {
  init: () => void;
  sendPage: (page: TAnalyticsPage) => void;
  sendSearchQuery: (query: string) => void;
  sendSearchEmpty: (query: string) => void;
  sendServiceClick: (serviceId: string, categoryId?: string) => void;
  sendServiceOpen: (serviceId: string) => void;
  sendCategoryClick: (categoryId: string) => void;
  sendChannelClick: (channelId: string) => void;
  sendSupportClick: (supportType: string, link: string) => void;
}
