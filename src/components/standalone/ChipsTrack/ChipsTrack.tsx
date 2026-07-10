import cx from 'clsx';
import * as React from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Button } from 'components/common';

import 'swiper/css';
import 'swiper/css/free-mode';

import s from './ChipsTrack.module.scss';
import { modeByVariant } from './config';
import { TChipItem, TChipsTrackVariant } from './types';

type TProps = {
  items: TChipItem[];
  activeId?: string;
  onItemClick: (id: string) => void;
  className?: string;
  trackClassName?: string;
  activeChipClassName?: string;
  variant?: TChipsTrackVariant;
  slidesOffset?: number;
};

const ChipsTrack: React.FC<TProps> = ({
  items,
  activeId,
  onItemClick,
  className,
  trackClassName,
  activeChipClassName,
  variant = 'primary',
  slidesOffset = 16,
}) => {
  if (items.length === 0) {
    return null;
  }

  const mode = modeByVariant[variant];

  return (
    <div className={cx(s.root, className)}>
      <Swiper
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={4}
        slidesOffsetBefore={slidesOffset}
        slidesOffsetAfter={slidesOffset}
        className={cx(s.root__track, trackClassName)}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <Button
              size="small"
              mode={mode}
              appearance="themed"
              className={cx(s.root__chip, item.id === activeId && activeChipClassName)}
              onClick={() => onItemClick(item.id)}
            >
              {item.label}
            </Button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default React.memo(ChipsTrack);
