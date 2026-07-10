import { Container as BaseContainer } from '@maxhub/max-ui';
import * as React from 'react';

type TProps = TDefaultProps;

const Container: React.FC<TProps> = ({ children, className }) => {
  return <BaseContainer className={className}>{children}</BaseContainer>;
};

export default React.memo(Container);
