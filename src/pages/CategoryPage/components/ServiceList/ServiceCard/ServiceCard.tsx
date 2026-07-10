import * as React from 'react';

import { Avatar, Typography, CellAction } from 'components/common';
import { resolveServiceItemIconUrl } from 'config/regionConfig';
import { TServiceItem } from 'types/config';

import s from './ServiceCard.module.scss';

type TProps = {
  service: TServiceItem;
  onClick: (serviceId: string) => void;
};

const ServiceCard: React.FC<TProps> = ({ service, onClick }) => {
  const iconUrl = resolveServiceItemIconUrl(service);

  const handleClick = React.useCallback(() => {
    onClick(service.id);
  }, [onClick, service.id]);

  return (
    <CellAction
      className={s.root}
      height="normal"
      innerClassNames={{ before: s.root__before }}
      before={
        <Avatar.Container size={40}>
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
      }
      showChevron
      onClick={handleClick}
    >
      <div className={s.root__content}>
        <Typography tag="headline" size="small" weight="strong">
          {service.name}
        </Typography>
        <Typography tag="title" size="small" color="secondary" className={s.root__description}>
          {service.description}
        </Typography>
      </div>
    </CellAction>
  );
};

export default React.memo(ServiceCard);
