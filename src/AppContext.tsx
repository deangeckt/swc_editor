import { createContext } from 'react';
import { IAppState } from './Wrapper';

export const AppContext = createContext({
    state: {},
    setState: () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        null;
    },
} as { state: IAppState; setState: any });
