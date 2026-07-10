import { Icon16ArrowLeftOutline } from '@vkontakte/icons';
import * as React from 'react';

import { TCommonIconProps } from '../types';

const IconArrowLeft: React.FC<TCommonIconProps> = ({ size = 16, className, style }) => {
  return <Icon16ArrowLeftOutline width={size} height={size} className={className} style={style} />;
};

export default React.memo(IconArrowLeft);
