import { Button as BaseButton, ButtonProps } from '@maxhub/max-ui';
import * as React from 'react';

type TProps = ButtonProps;

const Button: React.FC<TProps> = ({ children, ...props }) => {
  return <BaseButton {...props}>{children}</BaseButton>;
};

export default React.memo(Button);
