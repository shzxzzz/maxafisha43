import * as React from 'react';
import { Icon24CalendarOutline } from '@vkontakte/icons';

import { Icon, EIconType } from 'components/common/icons';
import { ERoutePath } from 'config/router';
import { TSupport } from 'types/config';

type TSupportBlockItem = {
  key: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  link: string;
};

export const getSupportItems = (support: TSupport): TSupportBlockItem[] =>
  [
    support.chatbot?.link && {
      key: 'chatbot',
      icon: <Icon type={EIconType.chatbot} size={20} />,
      ...support.chatbot,
    },
    support.operator?.link && {
      key: 'operator',
      icon: <Icon type={EIconType.operator} size={17} />,
      ...support.operator,
    },
    support.techSupport?.link && {
      key: 'techSupport',
      icon: <Icon type={EIconType.message} size={17} />,
      ...support.techSupport,
    },
    {
      key: 'events',
      icon: <Icon24CalendarOutline width={20} height={20} />,
      name: 'События',
      description: 'Перейти к афише ближайших мероприятий.',
      link: ERoutePath.events,
    },
  ].filter(Boolean) as TSupportBlockItem[];
