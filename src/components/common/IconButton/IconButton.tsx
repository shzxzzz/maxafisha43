import { IconButton as BaseIconButton, IconButtonProps } from '@maxhub/max-ui';
import * as React from 'react';

type TProps = IconButtonProps;

const IconButton: React.FC<TProps> = ({ children, ...props }) => {
  return <BaseIconButton {...props}>{children}</BaseIconButton>;
};

export default React.memo(IconButton);
