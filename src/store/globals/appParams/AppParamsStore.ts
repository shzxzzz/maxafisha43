import { computed, makeObservable, observable } from 'mobx';

import { ValueModel } from 'store/models/ValueModel';
import checkMobile from 'utils/checkMobile';
import findGetParameter from 'utils/findGetParameter';

import { IAppParamsStore } from './declarations';
import { TChatDataType, TParsedStartParams } from './types';

const GROUP_CHAT_TYPE = 'group';

export class AppParamsStore implements IAppParamsStore {
  search: string;
  locationHash: string;
  isProd: boolean;
  isDev: boolean;
  isMobile: boolean;

  private readonly _initData = new ValueModel<string | null>(null);
  private readonly _chatDataFromInitData = new ValueModel<TChatDataType>({ id: null, type: null });

  constructor() {
    this.search = location.search;
    this.locationHash = location.hash;
    this.isProd = process.env.NODE_ENV === 'production';
    this.isDev = false;
    this.isMobile = checkMobile();

    makeObservable<this>(this, {
      search: observable,
      locationHash: observable,
      isProd: observable,
      isDev: observable,
      isMobile: observable,

      isLocalDev: computed,
      isGroupChat: computed,
    });
  }

  get isLocalDev(): boolean {
    return location.hostname === 'localhost';
  }

  get initData(): string | null {
    return this._initData.value;
  }

  get chatIdFromInitData(): string | null {
    return this._chatDataFromInitData.value?.id;
  }

  get chatIdFromStartParam(): string | null {
    return this._parsedStartParams?.chatId ?? null;
  }

  get chatTypeFromStartParams(): string | null {
    return this._parsedStartParams?.chatType ?? null;
  }

  get isGroupChat(): boolean {
    return this.chatTypeFromStartParams === GROUP_CHAT_TYPE;
  }

  get chatId(): string | null {
    return this.chatIdFromStartParam ?? this.chatIdFromInitData ?? null;
  }

  private get _parsedStartParams(): TParsedStartParams | null {
    if (!this._startParams) {
      return null;
    }

    return this._startParams.split('_').reduce((acc, param) => {
      const idx = param.indexOf('-');
      const key = param.slice(0, idx);
      const value = param.slice(idx + 1);

      (acc as Record<string, any>)[key] = value;

      return acc;
    }, {} as TParsedStartParams);
  }

  private get _startParams(): string | null {
    return findGetParameter('start_param', `?${this._initData.value}`);
  }

  readonly setInitData = (initData: string): void => {
    this._initData.setValue(initData);
    this._chatDataFromInitData.setValue(AppParamsStore._parseChatData(initData));
  };

  private static _parseChatData = (initData: string | null): TChatDataType => {
    if (!initData) {
      return { id: null, type: null };
    }

    const chatDataParameter = findGetParameter('chat', `?${initData}`);

    if (!chatDataParameter) {
      return { id: null, type: null };
    }

    const rawChatData = JSON.parse(chatDataParameter) as TChatDataType;

    return {
      id: rawChatData.id ?? null,
      type: rawChatData.type ?? null,
    };
  };
}
