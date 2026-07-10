import * as React from 'react';

import { IconButton } from 'components/common';
import { Icon, EIconType } from 'components/common/icons';

import s from './ScrollToTopButton.module.scss';
import { getScrollParent } from './utils';

const SCROLL_THRESHOLD = 300;

const ScrollToTopButton: React.FC = () => {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const scrollParentRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const container = getScrollParent(wrap);

    scrollParentRef.current = container;

    if (!wrap || !container) {
      return undefined;
    }

    const handleScroll = () => {
      wrap.classList.toggle(s.root_visible, container.scrollTop > SCROLL_THRESHOLD);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = React.useCallback(() => {
    scrollParentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div ref={wrapRef} className={s.root}>
      <IconButton
        mode="primary"
        appearance="themed"
        size="medium"
        onClick={handleClick}
        aria-label="Наверх"
      >
        <Icon type={EIconType.arrowUp} size={20} />
      </IconButton>
    </div>
  );
};

export default React.memo(ScrollToTopButton);
