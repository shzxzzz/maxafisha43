import cx from 'clsx';
import * as React from 'react';

import { Button } from 'components/common';

import { modeByVariant } from '../ChipsTrack/config';
import { TChipItem, TChipsTrackVariant } from '../ChipsTrack/types';

import s from './ChipsWrap.module.scss';

type TProps = {
  items: TChipItem[];
  activeId?: string;
  onItemClick: (id: string) => void;
  className?: string;
  innerClassName?: string;
  activeChipClassName?: string;
  variant?: TChipsTrackVariant;

  /** Горизонтальные отступы ряда (как slidesOffset у свайпера) */
  horizontalPadding?: number;
};

const ChipsWrap: React.FC<TProps> = ({
  items,
  activeId,
  onItemClick,
  className,
  innerClassName,
  activeChipClassName,
  variant = 'primary',
  horizontalPadding = 16,
}) => {
  if (items.length === 0) {
    return null;
  }

  const mode = modeByVariant[variant];

  return (
    <div className={cx(s.root, className)}>
      <div
        className={cx(s.root__inner, innerClassName)}
        style={{ paddingLeft: horizontalPadding, paddingRight: horizontalPadding }}
      >
        {items.map((item) => (
          <Button
            key={item.id}
            size="small"
            mode={mode}
            appearance="themed"
            className={cx(s.root__chip, item.id === activeId && activeChipClassName)}
            onClick={() => onItemClick(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ChipsWrap);
