import useSWR, { useSWRConfig } from 'swr';
import { GlobalSessions, GlobalDefaults } from '../lib/types';
import useGlobalDefaults from './useGlobalDefaults';
import { useEffect } from 'react';

const STORAGE_KEY = 'app/global-sessions';

// Define the shape of the initial state without initializing it
const defaultState: GlobalSessions = {
  tentativeSessions: [],
  completedSessions: [],
};

// Fetcher that retrieves data from localStorage or returns a default state
const fetcher = (defaults: GlobalDefaults) => {
  // Generate initial tentative sessions based on defaults
  const initialTentativeSessions = Array.from(
    { length: defaults.defaultSessionAmount },
    (_, index) => ({
      sessionIndex: index,
      sessionType: index % 2 === 0 ? 'work' : 'break',
      sessionDuration:
        index % 2 === 0 ? defaults.defaultWorkDuration : defaults.defaultRestDuration,
    })
  );

  return {
    ...defaultState,
    tentativeSessions: initialTentativeSessions,
  };
};

export default function useGlobalSessions() {
    const { state: defaults } = useGlobalDefaults();
    const { cache } = useSWRConfig();

    // Use SWR with a key that depends on defaults to ensure re-fetching if defaults change
    const { data, error, mutate } = useSWR(
            [STORAGE_KEY, defaults], // Include defaults in the key to handle changes
            () => fetcher(defaults),
                {
                    revalidateOnFocus: false, // Prevent revalidation on tab focus
                    revalidateOnReconnect: false, // Prevent revalidation on network reconnect
                    fallbackData: fetcher(defaults), // Use dynamic initial state
                }
        );
    
    useEffect(() => {
        localStorage.removeItem(STORAGE_KEY)
    }, [])

    // Initialize localStorage and cache on first render if no data exists
    useEffect(() => {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
            const initialData = fetcher(defaults);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            mutate(initialData, false); // Update cache without revalidation
        }
    }, [defaults, mutate]);

    // Update state and persist to localStorage
    const updateState = (newState: Partial<GlobalSessions>) => {
    const updatedData = { ...data, ...newState } as GlobalSessions;

    mutate(updatedData, false); // Optimistically update cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    };

    return {
    state: data!,
    error,
    updateState,
    isLoading: !data && !error,
    };
}