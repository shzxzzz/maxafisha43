import * as React from 'react';

import { Button } from 'components/common';
import { TServiceType } from 'types/config';
import { useExternalOpen } from 'utils/hooks';

import { openService } from './utils';

type TProps = {
  type: TServiceType;
  link: string;
  onOpen: () => void;
};

const ServiceActionButton: React.FC<TProps> = ({ type, link, onOpen }) => {
  const { open, isLoading } = useExternalOpen();

  const handleClick = React.useCallback(() => {
    onOpen();
    open(() => openService(type, link));
  }, [type, link, onOpen, open]);

  return (
    <Button loading={isLoading} mode="primary" stretched onClick={handleClick}>
      Открыть
    </Button>
  );
};

export default React.memo(ServiceActionButton);
