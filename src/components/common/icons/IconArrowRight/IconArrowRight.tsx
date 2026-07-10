import { Icon16ArrowRightOutline } from '@vkontakte/icons';
import * as React from 'react';

import { TCommonIconProps } from '../types';

const IconArrowRight: React.FC<TCommonIconProps> = ({ size = 16, className, style }) => {
  return <Icon16ArrowRightOutline width={size} height={size} className={className} style={style} />;
};

export default React.memo(IconArrowRight);
