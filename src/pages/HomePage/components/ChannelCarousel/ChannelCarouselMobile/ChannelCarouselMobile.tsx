import * as React from 'react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { Typography } from 'components/common';
import { TChannel } from 'types/config';

import 'swiper/css';
import 'swiper/css/free-mode';

import { ChannelItem } from '../ChannelItem';

import s from './ChannelCarouselMobile.module.scss';

type TProps = {
  channels: TChannel[];
  onChannelClick: (channelId: string) => void;
};

const ChannelCarouselMobile: React.FC<TProps> = ({ channels, onChannelClick }) => {
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
      <Swiper
        modules={[FreeMode]}
        freeMode
        slidesPerView="auto"
        spaceBetween={12}
        slidesOffsetBefore={12}
        slidesOffsetAfter={12}
        className={s.root__track}
      >
        {channels.map((channel) => (
          <SwiperSlide key={channel.id}>
            <ChannelItem channel={channel} onClick={onChannelClick} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default React.memo(ChannelCarouselMobile);
