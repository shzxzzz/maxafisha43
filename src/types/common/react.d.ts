import type { ReactNode } from 'react';

declare global {
  type TPropsWithClassName = {
    className?: string;
  };

  type TPropsWithChildren = {
    children?: ReactNode;
  };

  type TDefaultProps = TPropsWithClassName & TPropsWithChildren;
}
