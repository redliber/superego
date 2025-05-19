// hooks/useGlobalState.js
import useSWR, { useSWRConfig } from 'swr';
import { GlobalDefaults } from '../lib/types';

// A unique key for the global state
const STORAGE_KEY = 'app/global-defaults';

const initialState: GlobalDefaults = {
  defaultWorkDuration: 25,
  defaultRestDuration: 5,
  defaultSessionAmount: 5,
};

// Initialize state from localStorage (runs only once during module load)
let defaultState: GlobalDefaults = { ...initialState };
if (typeof window !== 'undefined') {
  try {
    const storedState = localStorage.getItem(STORAGE_KEY);
    if (storedState) {
      const parsedState = JSON.parse(storedState) as GlobalDefaults;
      defaultState = {
        defaultWorkDuration: parsedState.defaultWorkDuration ?? initialState.defaultWorkDuration,
        defaultRestDuration: parsedState.defaultRestDuration ?? initialState.defaultRestDuration,
        defaultSessionAmount: parsedState.defaultSessionAmount ?? initialState.defaultSessionAmount,
      };
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    }
  } catch (e) {
    console.error('Failed to parse localStorage for global defaults:', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
  }
}

const fetcher = () => defaultState;

export default function useGlobalDefaults() {
    const { cache } = useSWRConfig(); // Access the SWR cache
    const { data, error, mutate } = useSWR(STORAGE_KEY, fetcher, {
        fallbackData: defaultState, // Use initial state if no data is cached
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    // Update the global state
    const updateState = (newState:Partial<GlobalDefaults>) => {
        const appendedData = { ...data, ...newState } as GlobalDefaults
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