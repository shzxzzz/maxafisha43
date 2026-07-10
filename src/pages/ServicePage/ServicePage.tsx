import * as React from 'react';
import { useParams } from 'react-router';

import { Page, Typography } from 'components/common';
import { findServiceOrChannel } from 'config/regionConfig';
import { useAnalyticsStore } from 'store/hooks';

import s from './ServicePage.module.scss';
import { ServiceActionButton } from './components/ServiceActionButton';
import { ServiceDescription } from './components/ServiceDescription';
import { ServiceHeader } from './components/ServiceHeader';
import { ServiceTags } from './components/ServiceTags';

const ServicePage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { sendServiceOpen } = useAnalyticsStore();

  const service = React.useMemo(
    () => (serviceId ? findServiceOrChannel(serviceId) : undefined),
    [serviceId]
  );

  const handleOpen = React.useCallback(() => {
    if (service) {
      sendServiceOpen(service.id);
    }
  }, [service, sendServiceOpen]);

  if (!service) {
    return (
      <Page shouldSendPageStat>
        <div className={s.root__empty}>
          <Typography tag="headline" size="large" weight="strong">
            Сервис не найден
          </Typography>
        </div>
      </Page>
    );
  }

  return (
    <Page
      shouldSendPageStat
      className={s.root}
      footer={<ServiceActionButton type={service.type} link={service.link} onOpen={handleOpen} />}
    >
      <ServiceHeader service={service} />
      <ServiceDescription description={service.description} />
      {service.tags && service.tags.length > 0 && <ServiceTags tags={service.tags} />}
    </Page>
  );
};

export default ServicePage;
