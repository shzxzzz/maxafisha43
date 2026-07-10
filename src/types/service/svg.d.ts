import type { FunctionComponent, ComponentProps } from 'react';

declare const svgImage: string;

declare const SvgReactComponent: FunctionComponent<ComponentProps<'svg'> & { title?: string }>;

declare global {
  declare module '*.svg?react' {
    export default SvgReactComponent;
  }

  declare module '*.svg' {
    export default svgImage;
  }
}
