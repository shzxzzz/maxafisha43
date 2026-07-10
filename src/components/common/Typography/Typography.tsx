import { Typography as BaseTypography } from '@maxhub/max-ui';
import clsx from 'clsx';
import * as React from 'react';

import s from './Typography.module.scss';
import { TColor, TFont, TSize, TTag, TWeight } from './types';

type TBaseProps = { variant: string; className?: string; children?: React.ReactNode };

const TAG_COMPONENTS: Record<TTag, React.ComponentType<TBaseProps>> = {
  body: BaseTypography.Body as React.ComponentType<TBaseProps>,
  label: BaseTypography.Label as React.ComponentType<TBaseProps>,
  headline: BaseTypography.Headline as React.ComponentType<TBaseProps>,
  title: BaseTypography.Title as React.ComponentType<TBaseProps>,
};

type TProps = React.PropsWithChildren<{
  tag?: TTag;
  size?: TSize;
  font?: TFont;
  weight?: TWeight;
  color?: TColor;
  className?: string;
}>;

const Typography: React.FC<TProps> = ({
  tag = 'body',
  size = 'medium',
  font = 'base',
  weight = 'regular',
  color = 'primary',
  className,
  children,
}) => {
  const Component = TAG_COMPONENTS[tag];

  return (
    <Component
      variant="custom"
      className={clsx(
        s.root,
        s[`root_tag-${tag}_size-${size}`],
        s[`root_font-${font}`],
        s[`root_weight-${weight}`],
        s[`root_color-${color}`],
        className
      )}
    >
      {children}
    </Component>
  );
};

export default React.memo(Typography);
