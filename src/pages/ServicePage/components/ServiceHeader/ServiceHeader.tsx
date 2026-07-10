import * as React from 'react';

import { Avatar, Typography } from 'components/common';
import { resolveServiceItemIconUrl } from 'config/regionConfig';
import { TServiceItem } from 'types/config';

import { ServiceTypeBadge } from '../ServiceTypeBadge';

import s from './ServiceHeader.module.scss';

type TProps = {
  service: TServiceItem;
};

const ServiceHeader: React.FC<TProps> = ({ service }) => {
  const iconUrl = resolveServiceItemIconUrl(service);

  return (
    <div className={s.root}>
      <Avatar.Container size={80} className={s.root__avatar}>
        {iconUrl ? (
          <Avatar.Image
            src={iconUrl}
            alt={service.name}
            fallback={service.name.charAt(0)}
            fallbackGradient="blue"
          />
        ) : (
          <Avatar.Text gradient="blue">{service.name.charAt(0)}</Avatar.Text>
        )}
      </Avatar.Container>
      <div className={s.root__text}>
        <Typography tag="headline" size="medium" weight="medium">
          {service.name}
        </Typography>
        <Typography tag="title" size="small" color="secondary">
          {service.owner}
        </Typography>
      </div>
      <ServiceTypeBadge type={service.type} />
    </div>
  );
};

export default React.memo(ServiceHeader);
