export type TCommonIconProps = {
  className?: string;
  size?: number;
  svgProps?: React.SVGProps<SVGSVGElement>;
  style?: React.CSSProperties;
};

export enum EIconType {
  arrowUp = 'arrowUp',
  channel = 'channel',
  chatbot = 'chatbot',
  arrowLeft = 'arrowLeft',
  arrowRight = 'arrowRight',
  externalLink = 'externalLink',
  form = 'form',
  miniApp = 'miniApp',
  operator = 'operator',
  message = 'message',
}
