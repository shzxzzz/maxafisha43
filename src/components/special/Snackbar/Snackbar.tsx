import { Icon24DismissDark } from '@vkontakte/icons';
import { Snackbar as VKSnackbar } from '@vkontakte/vkui';
import { observer } from 'mobx-react';
import * as React from 'react';

import { useSnackbarStore } from 'store/hooks';

import s from './Snackbar.module.scss';

const Snackbar: React.FC = () => {
  const { close, message } = useSnackbarStore();

  if (!message) {
    return null;
  }

  return (
    <VKSnackbar
      className={s.root}
      action={<Icon24DismissDark />}
      onClose={close}
      duration={message.duration}
      before={message.icon}
      layout="horizontal"
    >
      {message.text}
    </VKSnackbar>
  );
};

export default observer(Snackbar);
