import useSWR, { useSWRConfig } from 'swr';
import { GlobalSessions, GlobalDefaults, GlobalTracker, SessionObject, TentativeSessionObject } from '../lib/types';
import useGlobalDefaults from './useGlobalDefaults';
import { useEffect } from 'react';
import useGlobalTracker from './useGlobalTracker';

const STORAGE_KEY = 'app/global-sessions';

// Define the shape of the initial state without initializing it
const defaultState: GlobalSessions = {
  tentativeSessions: [],
  completedSessions: [],
  beginFocus: false,
  startCount: false,
  sessionIndex: 0,
  localSessionIndex: 0
};

const createTentativeSessions = (restDuration:number, workDuration:number, sessionAmount:number) => {
  const scaffoldingArray = Array.from({length: sessionAmount}, () => 0)
  const populateArray:TentativeSessionObject[] | TentativeSessionObject = 
    scaffoldingArray.map((item, index) => 
      {
        const workObject:TentativeSessionObject = {
          sessionIndex: index,
          sessionDuration: String(workDuration),
          sessionType: 'work'
        }
        
        const restObject:TentativeSessionObject = {
          sessionIndex: index,
          sessionDuration: String(restDuration),
          sessionType: 'break'
        }

        const sessionIndexArray = []
        if (index > 0) sessionIndexArray.push(restObject)
        sessionIndexArray.push(workObject)

        return sessionIndexArray
        }).flat()

    return populateArray
}

// Fetcher that retrieves data from localStorage or returns a default state
const fetcher = (defaults: GlobalDefaults):GlobalSessions => {

  return {
    ...defaultState,
    tentativeSessions: createTentativeSessions(defaults.defaultRestDuration, defaults.defaultWorkDuration, defaults.defaultSessionAmount),
  };
};

export default function useGlobalSessions() {
    const { state: defaults } = useGlobalDefaults();
    
    const { cache } = useSWRConfig();

    // Use SWR with a key that depends on defaults to ensure re-fetching if defaults change
    const { data, error, mutate } = useSWR(
      STORAGE_KEY, // Include defaults in the key to handle changes
      () => fetcher(defaults),
      {
        revalidateOnFocus: false, // Prevent revalidation on tab focus
        revalidateOnReconnect: false, // Prevent revalidation on network reconnect
        fallbackData: defaultState, // Use dynamic initial state
      }
    );
    
    // Making sure we start with a blank slate *MIGHT NEED TO BE ADJUSTED*
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

    useEffect(() => {

    }, [defaults.defaultRestDuration, defaults.defaultWorkDuration])

    // Update state and persist to localStorage
    const updateState = (newState: Partial<GlobalSessions>) => {
      const updatedData = { ...data, ...newState } as GlobalSessions;
      // console.log(`updatedData ${JSON.stringify(updatedData)}`);

      mutate(updatedData, false); // Optimistically update cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    };

    return {
      state: data!,
      error,
      updateState,
      createTentativeSessions,
      isLoading: !data && !error,
    };
}