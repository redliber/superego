import useSWR, { useSWRConfig } from 'swr';
import useGlobalDefaults from './useGlobalDefaults';
import { GlobalDefaults, GlobalTracker } from '../lib/types';
import { useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { DateTime } from 'luxon';
import useGlobalSessions from './useGlobalSessions';

const STORAGE_KEY = 'app/global-tracker';

const initialState: GlobalTracker = {
  sessionDuration: 25,
  sessionType: 'work',
  sessionBegin: false,
  focusBegin: false,
};

const fetcher = () => initialState;

export default function useGlobalTracker() {
    const { state: defaults, isLoading:loadingDefaults } = useGlobalDefaults();
    const { state: sessions } = useGlobalSessions()
    const { cache } = useSWRConfig();
    const { data, error, mutate } = useSWR(STORAGE_KEY, fetcher, {
        fallbackData: initialState,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const restartTimerToTime = (duration: number) => {
        const time = DateTime.now();
        return time.plus({ seconds: duration }).toJSDate();
    };

    const [useTargetTime, setTargetTime] = useState<Date>(() =>
        restartTimerToTime(data.sessionDuration)
    );

    const handleTimerExpire = () => {
        if (data) {
            console.log('Reached Time Expire Handler');
            if (data.sessionType === 'work') {
                const updatedData = {
                    ...data,
                    sessionDuration: defaults.defaultRestDuration,
                    sessionType: 'break',
                    sessionBegin: false,
                } as GlobalTracker;
                setTargetTime(restartTimerToTime(defaults.defaultRestDuration));
                mutate(updatedData, false);
            } else {
                const updatedData = {
                    ...data,
                    sessionDuration: defaults.defaultWorkDuration,
                    sessionType: 'work',
                    sessionBegin: false,
                } as GlobalTracker;
                setTargetTime(restartTimerToTime(defaults.defaultWorkDuration));
                mutate(updatedData, false);
            }
        }
    };

    const { 
        seconds, 
        minutes, 
        isRunning, 
        start, 
        pause, 
        resume, 
        restart 
    } = useTimer({
        expiryTimestamp: useTargetTime,
        autoStart: false,
        onExpire: handleTimerExpire,
    });

    useEffect(() => {
        if (!loadingDefaults) {
            // console.log('Finished Loading Defaults', defaults);
            const targetDuration = data.sessionType === "work" ? defaults.defaultWorkDuration : defaults.defaultRestDuration
            const newTargetTime = restartTimerToTime(targetDuration)
            setTargetTime(newTargetTime)
            restart(newTargetTime, false)
            mutate({...data, sessionDuration: targetDuration}, false)
        }
    }, [loadingDefaults])
    
    useEffect(() => {
        const targetDuration:number = data?.sessionDuration
        const newTargetTime = restartTimerToTime(targetDuration)
        setTargetTime(newTargetTime)
        restart(newTargetTime, false)

    }, [data.sessionDuration, data.sessionType, mutate]);
    
    useEffect(() => {
        const targetDuration:number = data.sessionType === "work" ? defaults.defaultWorkDuration : defaults.defaultRestDuration
        const newTargetTime = restartTimerToTime(targetDuration)
        setTargetTime(newTargetTime)
        restart(newTargetTime, false)
        mutate({...data, sessionDuration: targetDuration}, false)
    }, [defaults.defaultRestDuration, defaults.defaultWorkDuration])

    const updateState = (newState: Partial<GlobalTracker>) => {
        const updatedData = { ...data, ...newState } as GlobalTracker;
        // console.log('Reached Data Mutation in useGlobalTracker.ts', newState)
        mutate(updatedData, false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    };

    return {
        state: data!,
        timeObject: { seconds, minutes, isRunning },
        start,
        pause,
        resume,
        restart,
        error,
        updateState,
        isLoading: !data && !error,
    };
}