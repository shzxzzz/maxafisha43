import * as React from 'react';

import { CellAction, Typography } from 'components/common';

import s from './SupportItem.module.scss';

type TProps = {
  supportType: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  link: string;
  onClick: (type: string, link: string) => void;
  disabled?: boolean;
};

const SupportItem: React.FC<TProps> = ({
  supportType,
  icon,
  name,
  description,
  link,
  onClick,
  disabled,
}) => {
  const handleClick = React.useCallback(() => {
    onClick(supportType, link);
  }, [onClick, supportType, link]);

  return (
    <CellAction
      height="normal"
      before={<div className={s['root__icon-wrap']}>{icon}</div>}
      showChevron
      onClick={handleClick}
      className={s.root}
      disabled={disabled}
    >
      <div className={s.root__content}>
        <Typography tag="title" size="large" weight="medium">
          {name}
        </Typography>
        <Typography tag="title" size="small" className={s.root__description}>
          {description}
        </Typography>
      </div>
    </CellAction>
  );
};

export default React.memo(SupportItem);
