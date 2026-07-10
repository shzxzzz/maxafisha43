import { Icon16ArrowUpOutline } from '@vkontakte/icons';
import * as React from 'react';

import { TCommonIconProps } from '../types';

const IconArrowUp: React.FC<TCommonIconProps> = ({ size = 16, className, style }) => {
  return <Icon16ArrowUpOutline width={size} height={size} className={className} style={style} />;
};

export default React.memo(IconArrowUp);
