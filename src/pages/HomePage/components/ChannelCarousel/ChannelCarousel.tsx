import * as React from 'react';

import { TChannel } from 'types/config';

import s from './ChannelCarousel.module.scss';
import { ChannelCarouselDesktop } from './ChannelCarouselDesktop';
import { ChannelCarouselMobile } from './ChannelCarouselMobile';

type TProps = {
  channels: TChannel[];
  onChannelClick: (channelId: string) => void;
};

const ChannelCarousel: React.FC<TProps> = (props) => (
  <>
    <div className={s.mobile}>
      <ChannelCarouselMobile {...props} />
    </div>
    <div className={s.desktop}>
      <ChannelCarouselDesktop {...props} />
    </div>
  </>
);

export default React.memo(ChannelCarousel);
