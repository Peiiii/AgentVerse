import { ITypedKey } from './types';

export const createKey = <T>(id: string): ITypedKey<T> => ({
    _type: null as T,
    id
});

export const isKey = (obj: unknown): obj is ITypedKey<unknown> => {
    return obj !== null && 
           typeof obj === 'object' && 
           '_type' in obj && 
           'id' in obj &&
           typeof (obj as ITypedKey<unknown>).id === 'string';
}; 