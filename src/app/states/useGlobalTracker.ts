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

    const handleDurationChange = (targetDuration:number, mutateDuration:boolean=false) => {
        const newTargetTime = restartTimerToTime(targetDuration)
        setTargetTime(newTargetTime)
        restart(newTargetTime, false)
        if (mutateDuration) {
            mutate({...data, sessionDuration: targetDuration}, false)
        }
    }

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

    // Initial Loading, waiting for the defaults from useGlobalDefaults
    useEffect(() => {
        if (!loadingDefaults) {
            const targetDuration = data.sessionType === "work" ? defaults.defaultWorkDuration : defaults.defaultRestDuration
            handleDurationChange(targetDuration, true)
        }
    }, [loadingDefaults])
    
    // Adjust changing sessionDuration
    useEffect(() => {
        handleDurationChange(data?.sessionDuration)
    }, [data.sessionDuration, data.sessionType, mutate]);
    
    // Adjust changing defaultDuration
    useEffect(() => {
        const targetDuration:number = data.sessionType === "work" ? defaults.defaultWorkDuration : defaults.defaultRestDuration
        handleDurationChange(targetDuration, true)
    }, [defaults.defaultRestDuration, defaults.defaultWorkDuration])

    // // Starting Sessions
    // useEffect(() => {
    //     if (isRunning) {
    //         mutate({...data, sessionDuration: seconds}, false)
    //     }
    // }, [start, seconds, minutes, isRunning])

    const updateState = (newState: Partial<GlobalTracker>) => {
        const updatedData = { ...data, ...newState } as GlobalTracker;
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
        handleDurationChange,
        error,
        updateState,
        isLoading: !data && !error,
    };
}