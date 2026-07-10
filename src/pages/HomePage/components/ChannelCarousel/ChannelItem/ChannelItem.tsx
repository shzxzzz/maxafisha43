import * as React from 'react';

import { Avatar, Typography } from 'components/common';
import { resolveIconUrl } from 'config/regionConfig';
import { TChannel } from 'types/config';

import s from './ChannelItem.module.scss';

type TProps = {
  channel: TChannel;
  onClick: (channelId: string) => void;
};

const ChannelItem: React.FC<TProps> = ({ channel, onClick }) => {
  const iconUrl = resolveIconUrl(channel.icon, 'channels');

  const handleClick = React.useCallback(() => {
    onClick(channel.id);
  }, [onClick, channel.id]);

  return (
    <div className={s.root} onClick={handleClick}>
      <Avatar.Container size={56} form="circle" className={s.root__avatar}>
        {iconUrl ? (
          <Avatar.Image
            src={iconUrl}
            alt={channel.name}
            fallback={channel.name.charAt(0)}
            fallbackGradient="blue"
          />
        ) : (
          <Avatar.Text gradient="blue">{channel.name.charAt(0)}</Avatar.Text>
        )}
      </Avatar.Container>
      <Typography tag="label" size="small" className={s.root__name}>
        {channel.name}
      </Typography>
    </div>
  );
};

export default React.memo(ChannelItem);
