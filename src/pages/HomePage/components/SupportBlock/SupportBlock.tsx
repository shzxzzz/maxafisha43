import * as React from 'react';

import { TSupport } from 'types/config';

import s from './SupportBlock.module.scss';
import { SupportItem } from './SupportItem';
import { getSupportItems } from './config';

type TProps = {
  support: TSupport;
  onSupportClick: (type: string, link: string) => void;
  isLoading?: boolean;
};

const SupportBlock: React.FC<TProps> = ({ support, onSupportClick, isLoading }) => {
  const items = getSupportItems(support);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className={s.root}>
      <div className={s.root__list}>
        {items.map((item) => (
          <SupportItem
            {...item}
            key={item.key}
            supportType={item.key}
            onClick={onSupportClick}
            disabled={isLoading}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(SupportBlock);
