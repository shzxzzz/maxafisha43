import * as React from 'react';

import { TServiceItem } from 'types/config';

import { ServiceCard } from './ServiceCard';
import s from './ServiceList.module.scss';
import { ServiceListEmpty } from './ServiceListEmpty';

type TProps = {
  services: TServiceItem[];
  onServiceClick: (serviceId: string) => void;
};

const ServiceList: React.FC<TProps> = ({ services, onServiceClick }) => {
  if (services.length === 0) {
    return <ServiceListEmpty />;
  }

  return (
    <div className={s.root}>
      {services.map((svc) => (
        <ServiceCard key={svc.id} service={svc} onClick={onServiceClick} />
      ))}
    </div>
  );
};

export default React.memo(ServiceList);
