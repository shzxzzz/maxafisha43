export type TServiceType = 'chatbot' | 'site' | 'miniApp' | 'form' | 'channel';

export type TService = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  type: TServiceType;
  owner: string;
  link: string;
  tags?: string[];
  category_ids: string[];
  popular?: boolean;
  federal?: boolean;
};

export type TChannel = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  type: TServiceType;
  owner: string;
  link: string;
  tags?: string[];
  category_ids?: string[];
  popular?: boolean;
  federal?: boolean;
};

export type TServiceItem = TService | TChannel;

export type TCategory = {
  id: string;
  name: string;
  icon?: string;
  show_on_main?: boolean;
};

export type TSupportItem = {
  name: string;
  description: string;
  link: string;
} | null;

export type TSupport = {
  chatbot?: TSupportItem;
  operator?: TSupportItem;
  techSupport?: TSupportItem;
};

export type TAnalytics = {
  mytracker: {
    enabled: boolean;
    trackerId: string;
  };
  yandexMetrika: {
    enabled: boolean;
    counterId: string;
  };
};

export type TRegionConfig = {
  channels: TChannel[];
  categories: TCategory[];
  services: TService[];
  support: TSupport;
  analytics: TAnalytics;
};
