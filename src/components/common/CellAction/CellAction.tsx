import { CellAction as BaseCellAction, CellActionProps } from '@maxhub/max-ui';
import * as React from 'react';

type TProps = CellActionProps;

const CellAction: React.FC<TProps> = (props) => <BaseCellAction {...props} />;

export default React.memo(CellAction);
