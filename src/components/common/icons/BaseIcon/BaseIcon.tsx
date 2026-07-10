import * as React from 'react';

import { TCommonIconProps } from '../types';

type TProps = TCommonIconProps & {
  children?: React.ReactNode;
};

const BaseIcon: React.FC<TProps> = (props: TProps) => {
  const { size, className, children, svgProps = {}, style } = props;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      {...svgProps}
    >
      {children}
    </svg>
  );
};

export default React.memo(BaseIcon);
