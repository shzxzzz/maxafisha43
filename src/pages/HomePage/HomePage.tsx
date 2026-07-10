import { observer } from 'mobx-react';
import * as React from 'react';

import { Page } from 'components/common';
import { regionConfig } from 'config/regionConfig';
import { ERoutePath } from 'config/router';
import { useAnalyticsStore, useRouterStore } from 'store/hooks';
import { useExternalOpen } from 'utils/hooks';

import s from './HomePage.module.scss';
import { CategoryChips } from './components/CategoryChips';
import { CategoryGrid } from './components/CategoryGrid';
import { ChannelCarousel } from './components/ChannelCarousel';
import { SearchBar } from './components/SearchBar';
import { SupportBlock } from './components/SupportBlock';

const { channels, categories, services, support } = regionConfig;

const hasSupportItems = true;

const HomePage: React.FC = () => {
  const { push } = useRouterStore();
  const { sendChannelClick, sendCategoryClick, sendSupportClick } = useAnalyticsStore();
  const { open: openExternal, isLoading: isExternalOpening } = useExternalOpen();

  const categoriesWithSvs = React.useMemo(() => {
    const allItems = [...services, ...channels];

    return categories.filter((cat) => allItems.some((item) => item.category_ids?.includes(cat.id)));
  }, []);

  const mainCategories = React.useMemo(() => {
    const withServicesIds = new Set(categoriesWithSvs.map((c) => c.id));

    return categories.filter((cat) => cat.show_on_main && withServicesIds.has(cat.id));
  }, [categoriesWithSvs]);

  const chipCategories = React.useMemo(() => {
    return categoriesWithSvs.filter((cat) => !cat.show_on_main);
  }, [categoriesWithSvs]);

  const handleChannelClick = React.useCallback(
    (channelId: string) => {
      sendChannelClick(channelId);
      push(ERoutePath.service, { dynamicParams: { serviceId: channelId } });
    },
    [push, sendChannelClick]
  );

  const handleCategoryClick = React.useCallback(
    (categoryId: string) => {
      sendCategoryClick(categoryId);
      push(ERoutePath.category, { dynamicParams: { categoryId } });
    },
    [push, sendCategoryClick]
  );

  const handleSupportClick = React.useCallback(
    (supportType: string, link: string) => {
      sendSupportClick(supportType, link);
      if (supportType === 'events') {
        push(ERoutePath.events);
        return;
      }

      openExternal(() => WebApp.openMaxLink(link));
    },
    [push, sendSupportClick, openExternal]
  );

  const handleAllServicesClick = React.useCallback(() => {
    push(ERoutePath.categories);
  }, [push]);

  return (
    <Page
      shouldSendPageStat
      className={s.root}
      contentClassName={hasSupportItems ? s['root_with-bottom-block'] : undefined}
    >
      <ChannelCarousel channels={channels} onChannelClick={handleChannelClick} />
      <SearchBar />
      <CategoryChips categories={chipCategories} onCategoryClick={handleCategoryClick} />
      <CategoryGrid
        categories={mainCategories}
        onCategoryClick={handleCategoryClick}
        onAllServicesClick={handleAllServicesClick}
      />
      <div className={s.root__support}>
        <SupportBlock
          support={support}
          onSupportClick={handleSupportClick}
          isLoading={isExternalOpening}
        />
      </div>
    </Page>
  );
};

export default observer(HomePage);
