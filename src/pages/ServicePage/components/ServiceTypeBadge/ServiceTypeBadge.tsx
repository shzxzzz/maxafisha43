import * as React from 'react';

import { Typography } from 'components/common';
import { Icon, EIconType } from 'components/common/icons';
import { TServiceType } from 'types/config';

import s from './ServiceTypeBadge.module.scss';

const BADGE_CONFIG: Record<TServiceType, { iconType: EIconType; label: string }> = {
  chatbot: { iconType: EIconType.chatbot, label: 'Чат-бот' },
  site: { iconType: EIconType.externalLink, label: 'Сайт' },
  miniApp: { iconType: EIconType.miniApp, label: 'Мини-приложение' },
  form: { iconType: EIconType.form, label: 'Опрос' },
  channel: { iconType: EIconType.channel, label: 'Канал' },
};

type TProps = {
  type: TServiceType;
};

const ServiceTypeBadge: React.FC<TProps> = ({ type }) => {
  const { iconType, label } = BADGE_CONFIG[type];

  return (
    <div className={s.root}>
      <Icon type={iconType} size={24} />
      <Typography tag="title" size="large" weight="medium" color="primary">
        {label}
      </Typography>
    </div>
  );
};

export default React.memo(ServiceTypeBadge);
