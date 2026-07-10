type TJsonPrimitiveType = string | number | boolean | null;

type TJsonType = TJsonPrimitiveType | TJsonType[] | { [key: string]: TJsonType };

type TJsonComplexType = Exclude<TJsonType, TJsonPrimitiveType>;
