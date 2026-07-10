import { SearchInput as BaseSearchInput, SearchInputProps } from '@maxhub/max-ui';
import cx from 'clsx';
import * as React from 'react';

import s from './SearchInput.module.scss';

type TProps = SearchInputProps;

const SearchInput: React.FC<TProps> = ({ className, ...props }) => (
  <BaseSearchInput className={cx(s.root, className)} {...props} />
);

export default React.memo(SearchInput);
