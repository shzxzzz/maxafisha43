import * as React from 'react';
import type { Swiper as SwiperClass } from 'swiper';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { IconButton, Typography } from 'components/common';
import { IconArrowLeft, IconArrowRight } from 'components/common/icons';
import { TChannel } from 'types/config';

import 'swiper/css';
import 'swiper/css/free-mode';

import { ChannelItem } from '../ChannelItem';

import s from './ChannelCarouselDesktop.module.scss';

type TProps = {
  channels: TChannel[];
  onChannelClick: (channelId: string) => void;
};

const ChannelCarouselDesktop: React.FC<TProps> = ({ channels, onChannelClick }) => {
  const swiperRef = React.useRef<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = React.useState(true);
  const [isEnd, setIsEnd] = React.useState(true);

  const syncEdges = React.useCallback((sw: SwiperClass) => {
    setIsBeginning(sw.isBeginning);
    setIsEnd(sw.isEnd);
  }, []);

  const showNavButtons = !(isBeginning && isEnd);

  const handleNext = React.useCallback(() => {
    swiperRef.current?.slideNext();
  }, []);

  const handlePrev = React.useCallback(() => {
    swiperRef.current?.slidePrev();
  }, []);

  React.useEffect(() => {
    const sw = swiperRef.current;

    if (!sw) {
      return;
    }

    requestAnimationFrame(() => {
      sw.update();
      syncEdges(sw);
    });
  }, [showNavButtons, syncEdges]);

  if (channels.length === 0) {
    return null;
  }

  return (
    <div className={s.root}>
      <Typography
        tag="label"
        weight="medium"
        size="large"
        color="secondary"
        className={s.root__title}
      >
        Официальные каналы
      </Typography>
      <div className={s.root__row}>
        {showNavButtons ? (
          <IconButton
            mode="secondary"
            appearance="themed"
            size="medium"
            className={s.root__nav}
            disabled={isBeginning}
            aria-label="Предыдущие каналы"
            onClick={handlePrev}
          >
            <IconArrowLeft size={20} />
          </IconButton>
        ) : null}
        <Swiper
          modules={[FreeMode]}
          freeMode
          slidesPerView="auto"
          spaceBetween={12}
          className={s.root__track}
          onSwiper={(sw) => {
            swiperRef.current = sw;
          }}
          onProgress={syncEdges}
          onResize={syncEdges}
        >
          {channels.map((channel) => (
            <SwiperSlide key={channel.id}>
              <ChannelItem channel={channel} onClick={onChannelClick} />
            </SwiperSlide>
          ))}
        </Swiper>
        {showNavButtons ? (
          <IconButton
            mode="secondary"
            appearance="themed"
            size="medium"
            className={s.root__nav}
            disabled={isEnd}
            aria-label="Следующие каналы"
            onClick={handleNext}
          >
            <IconArrowRight size={20} />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
};

export default React.memo(ChannelCarouselDesktop);
