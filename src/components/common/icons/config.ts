import * as React from 'react';

import { IconArrowLeft } from './IconArrowLeft';
import { IconArrowRight } from './IconArrowRight';
import { IconArrowUp } from './IconArrowUp';
import { IconChannel } from './IconChannel';
import { IconChatbot } from './IconChatbot';
import { IconExternalLink } from './IconExternalLink';
import { IconForm } from './IconForm';
import { IconMessage } from './IconMessage';
import { IconMiniApp } from './IconMiniApp';
import { IconOperator } from './IconOperator';
import { TCommonIconProps, EIconType } from './types';

export const mapIconTypeToComponent: Record<EIconType, React.ComponentType<TCommonIconProps>> = {
  [EIconType.arrowUp]: IconArrowUp,
  [EIconType.chatbot]: IconChatbot,
  [EIconType.arrowLeft]: IconArrowLeft,
  [EIconType.arrowRight]: IconArrowRight,
  [EIconType.channel]: IconChannel,
  [EIconType.externalLink]: IconExternalLink,
  [EIconType.form]: IconForm,
  [EIconType.miniApp]: IconMiniApp,
  [EIconType.operator]: IconOperator,
  [EIconType.message]: IconMessage,
};
