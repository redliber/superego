// hooks/useGlobalState.js
import useSWR, { useSWRConfig } from 'swr';
import { GlobalDefaults } from '../lib/types';

// A unique key for the global state
const STORAGE_KEY = 'app/global-defaults';

// Initial state (optional, can be fetched or set locally)
const initialState : GlobalDefaults = {
    defaultWorkDuration: 25,    
    defaultRestDuration: 5,
    defaultSessionAmount: 5
};

if (typeof window !== 'undefined') {
    const globalStateStorage : GlobalDefaults = JSON.parse(String(localStorage.getItem(STORAGE_KEY)))
    if (!globalStateStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState))
        initialState.defaultWorkDuration = 25
        initialState.defaultRestDuration = 5
        initialState.defaultSessionAmount = 5
    } else {
        initialState.defaultWorkDuration = globalStateStorage.defaultWorkDuration
        initialState.defaultRestDuration = globalStateStorage.defaultRestDuration
        initialState.defaultSessionAmount = globalStateStorage.defaultSessionAmount
    }

}

// Fetcher function (optional, can be a no-op for local state)
const fetcher = () => initialState;

export default function useGlobalDefaults() {
    const { cache } = useSWRConfig(); // Access the SWR cache
    const { data, error, mutate } = useSWR(STORAGE_KEY, fetcher, {
        fallbackData: initialState, // Use initial state if no data is cached
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    // Update the global state
    const updateState = (newState:Partial<GlobalDefaults>) => {
        const appendedData = { ...data, ...newState }
        console.log(`Updating State with --> ${JSON.stringify(newState)}`)

        // Optimistically update the cache
        mutate(appendedData, false); // false prevents revalidation
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appendedData))
    };

    return {
    state: data,
    error,
    updateState,
    isLoading: !data && !error,
    };
}