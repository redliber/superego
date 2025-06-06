'use client'
import { ChangeEvent, ReactEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { useCounter } from "@uidotdev/usehooks";
import { addInterval, parseTimeZoneBeforePOST, subInterval, subTime } from "@/app/lib/utils";
import { DateTime } from "luxon";
import { useTime, useTimer } from "react-timer-hook"


import MainButton from "../MainUIs/MainButton";
import MainTimeSlider from "../MainUIs/MainTimeSlider";
import MainInputText from "../MainUIs/MainInputText";
import { EntryObject, GlobalSessions, SessionObject, TentativeSessionObject } from "@/app/lib/types";

import useSWR, {useSWRConfig} from 'swr';
import MainModal from "../MainUIs/MainModal";
import { Preahvihear } from "next/font/google";
import MainTimeScrub from "../MainUIs/MainTimeScrub";
import Entries from "./Entries";
import { Settings } from "lucide-react";
import useGlobalDefaults from "@/app/states/useGlobalDefaults";
import useGlobalSessions from "@/app/states/useGlobalSessions";
import useGlobalTracker from "@/app/states/useGlobalTracker";




export default function Main() {
  const { cache, mutate } = useSWRConfig()
  const modalRef = useRef(null)
  const settingsRef = useRef(null)

  const serverEntries = cache.get("/api/entry")

  const { state:globalDefaults , updateState:updateGlobalDefaults } = useGlobalDefaults()
  const { 
    defaultWorkDuration, 
    defaultRestDuration, 
    defaultSessionAmount 
  } = globalDefaults

  const { state:globalSessions, updateState:updateGlobalSessions} = useGlobalSessions()
  const { 
    tentativeSessions, 
    completedSessions,  
    beginFocus, 
    startCount, 
    sessionIndex, 
    localSessionIndex 
  } = globalSessions

  const {
    state:globalTracker, 
    timeObject,
    start, pause, resume, restart, 
    updateState:updateGlobalTracker 
  } = useGlobalTracker()
  
  const { 
    sessionDuration, 
    sessionType, 
    sessionBegin 
  } = globalTracker
  const {seconds, minutes, isRunning} = timeObject

  // LOCALSTORAGE
  const [useEntryObject, setEntryObject] = useState<EntryObject | null>(null)

  // ACTIVE DURATIONS
  const [useDuration, setDuration] = useState(defaultWorkDuration)
  const [useRestDuration, setRestDuration] = useState(defaultRestDuration)
  // If useRest is true, use useRestDuration
  const [useRest, setRest] = useState(false)
  
  const [useDeadline, setDeadline] = useState('')
  const [useDifference, setDifference] = useState(useDuration)
  const [useTime, setTime] = useState(subTime(useDeadline, DateTime.now().toISO()))

  // JOURNALING
  const [useFocusTitle, setFocusTitle] = useState('')
  const [useFocusJournal, setFocusJournal] = useState('')

  const [useLoadingPosting, setLoadingPosting] = useState(false)
  const [useDebug, setDebug] = useState(true)

  function handleTentativeSessionsChange (newDuration:number, target:string) {
    const newTentativeSessions:TentativeSessionObject[] = tentativeSessions
    if (target !== "session") {
      const adjustedNewTentativeSessions:TentativeSessionObject[] = newTentativeSessions.map(({sessionType, sessionDuration, sessionIndex}, index) => {
        const determineDuration = ():string => {
          if (target === "default-work" && sessionType === "work") {
            return String(newDuration)
          } else if ((target === "default-break" && sessionType === "break")) {
            return String(newDuration)
          } else {
            return sessionDuration
          }
        } 

        return {
          sessionDuration: determineDuration(),
          sessionIndex: sessionIndex,
          sessionType: sessionType
        }
      })  

      updateGlobalSessions({
        tentativeSessions: adjustedNewTentativeSessions
      })
    } else {
      newTentativeSessions[localSessionIndex].sessionDuration = String(newDuration)
      updateGlobalSessions({tentativeSessions: newTentativeSessions})
    }

  }

  useEffect(() => {
    if (beginFocus) {
      // Signifying the beginning of a Focus, saving the Focus Entry to `localStorage`. Saving `EntryObject` should only be for each beginnings of Focus.
      const newEntryObject = {
        entryTime: parseTimeZoneBeforePOST(DateTime.now().toISO()),
        entryEfficiency: 0,
        entryJournal: '',
        entryName: useFocusTitle,
      };

      // Update globalDefaults
      setEntryObject(newEntryObject);

      // Update localStorage with the same object
      localStorage.setItem('EntryObject', JSON.stringify(newEntryObject));
    }
  }, [beginFocus])

  // Logic for Starting Count
  useEffect(() => {
    if (startCount) {
      const interval = setInterval(
        () => setTime(subTime(useDeadline, DateTime.now().toISO())),
        1000
      )

      if (!Number.isNaN(useTime)) {
        setDifference(useTime)
        useRest ? setRestDuration(useTime) : setDuration(useTime)
      }

      return () => clearInterval(interval)
    } else {
      setTime(useRest ? useRestDuration : useDuration)
    }
  }, [startCount, useDuration, useTime, useRestDuration])

  // Logic for Finishing a Session
  useEffect(() => {
    if (useTime === 0) {
      if (!useRest) {

        updateGlobalSessions({
          localSessionIndex: localSessionIndex + 1,
          startCount: false,
          sessionIndex: startCount ? (sessionIndex + 1) :         sessionIndex
        })

        setTime(defaultWorkDuration)
        setDuration(defaultWorkDuration)
        setRest(true)
      } else {
        updateGlobalSessions({
          localSessionIndex: localSessionIndex + 1,
          startCount: false
        })

        setTime(defaultRestDuration)
        setRestDuration(defaultRestDuration)
        setRest(false)
      } 
    }
  }, [useTime, useRest, startCount])

  useEffect(() => {
    if (sessionIndex <= 0 && startCount) {
      console.log('Changing beginFocus to true');
      updateGlobalSessions({beginFocus: true})
    }
  }, [startCount, sessionIndex])



  function startFocusHandler () {
    start()
    setDeadline(addInterval(new Date().toISOString(), `PT${useRest ? useRestDuration : useDuration}S`)) // Use M instead of S when finished with debugging

    const currentSession : SessionObject = {
      sessionIndex: sessionIndex,
      sessionTime: parseTimeZoneBeforePOST(DateTime.now().toISO()),
      sessionDuration: String(sessionDuration),
      sessionType: useRest ? 'break' : 'work',
    }

    // Signifying the beginning of a Session. Saving the Session entry into `localStorage`.
    updateGlobalSessions({
      startCount: true,
      completedSessions: [...completedSessions, currentSession]})
  }

  function finishSessionEarly () {
    const adjustDuration = useDifference
    const getCompleteSessions = completedSessions
    const adjustCurrentSession = getCompleteSessions[localSessionIndex]
    const currentSessionDuration = adjustCurrentSession.sessionDuration
    adjustCurrentSession.sessionDuration = String(Number(currentSessionDuration) - adjustDuration)
    
    updateGlobalSessions({
      completedSessions: getCompleteSessions
    })

    setTime(0)
  }

  async function cleanFocusHandler () {
    setDuration(defaultWorkDuration)
    setTime(defaultWorkDuration)

    updateGlobalSessions({
      beginFocus: false, 
      sessionIndex: 0,
      startCount: false,
      completedSessions: []
    })

    setRest(false)
    setFocusTitle('')
  }

  function onTitleChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    setFocusTitle(e.target.value)
  }

  function onJournalChangeHandler(e: ChangeEvent<HTMLTextAreaElement>) {
    setFocusJournal(e.target.value)
  }

  function postFocusEntry() {

  }

  async function recordFocusHandler() {
    if (useEntryObject) {
      setEntryObject((prev:any) => ({
        ...prev,
        ['entryJournal']: useFocusJournal
      }))

      const entry = {
        ...useEntryObject,
        entryJournal: useFocusJournal
      }

      try {
        setLoadingPosting(true)
        const getEntryID = await postEntry(entry)

        const sessionsIDs: any[] = []

        await Promise.all(completedSessions.map(async (item : SessionObject) => {
          const newItem = {...item, sessionEntry: {id: getEntryID}}
          const sessionID = await postSession(getEntryID, newItem)
          sessionsIDs.push(sessionID)
        }))
      } catch (e) {
        console.error(`Error at recordFocusHandler, ${e}`)
        throw e
      } finally {
        cleanFocusHandler()
        // @ts-ignore
        modalRef.current.closeModal()
      }
    }

    setLoadingPosting(false)
  }

  async function postEntry(entry: EntryObject) {
    try {
      const response = await fetch('/api/entry', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(entry)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to create entry: ${response.statusText}`);
      }

      mutate("/api/entry")

      return result
    } catch (e) {
      console.error(e)
    }
  }

  async function postSession(entryID: string, sessionObject: SessionObject) {
    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(sessionObject)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`)
      }
      mutate('/api/session')

      return result
    } catch (e) {
      console.error(e)
    }
  }



  return (
    <>


      {/* DEBUGGING AREA */}
      <div className="fixed top-0 right-[36rem] z-[9999] p-4  w-xl flex flex-col gap-4 ">
        <div className="cursor-pointer hover:font-black" onClick={() => setDebug(!useDebug)}>MainPage Debug</div>
                {
                  useDebug && (
                    <div className="flex h-[400px] flex-col mb-10 font-thin text-sm bg-gray-600 p-6 overflow-y-scroll">

                      <div className="flex flex-col my-4 border-[1px] p-3">
                        <div className="flex flex-row justify-between">
                          <p>Begin Focus</p>
                          <p className=" font-black">{String(beginFocus)}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>Start Count</p><p className=" font-black">{String(startCount)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col my-4 border-[1px] p-3">
                        <div className="flex flex-row justify-between">
                          <p>Deadline</p>
                          <p className=" font-black">{useDeadline}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>Time</p>
                          <p className=" font-black">{String(useTime)}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>Difference</p>
                          <p className=" font-black">{useDifference}</p>
                        </div>
                      </div>


                      <div className="flex flex-col my-4 border-[1px] p-3">
                        <div className="flex flex-row justify-between">
                          <p>sessionDuration</p>
                          <p className=" font-black">{sessionDuration}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>sessionType</p>
                          <p className=" font-black">{sessionType}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>isRunning</p>
                          <p className=" font-black">{String(isRunning)}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>seconds</p>
                          <p className=" font-black">{String(seconds)}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>minutes</p>
                          <p className=" font-black">{String(minutes)}</p>
                        </div>
                      </div>




                      <div className="flex flex-col my-4 gap-4 border-[1px] p-3">
                        <div className="flex flex-col">
                          <div className="flex flex-row justify-between">
                            <p>Duration</p><p className=" font-black">{useDuration}</p>
                          </div>
                          <div className="flex flex-row justify-between">
                            <p>Rest Duration</p><p className=" font-black">{useRestDuration}</p>
                          </div>
                        </div>

                        <div className="flex flex-col">
                        <div className="flex flex-row justify-between">
                          <p>defaultWorkDuration</p>
                          <p className=" font-black">{String(defaultWorkDuration)}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>defaultRestDuration</p>
                          <p className=" font-black">{String(defaultRestDuration)}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>defaultSessionAmount</p>
                          <p className=" font-black">{String(defaultSessionAmount)}</p>
                        </div>
                      </div>

                      </div>

                      <div className="flex flex-col my-4 border-[1px] p-3">
                        <div className="flex flex-row justify-between">
                          <p>Current Session Index</p>
                          <p className=" font-black">{sessionIndex}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>Current Local Session Index</p>
                          <p className=" font-black">{localSessionIndex}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>Current Session Type</p>
                          <p className=" font-black">{useRest ? 'Rest' : 'Work'}</p>
                        </div>
                      </div>


                      <div className="flex flex-col gap-2 my-4 border-[1px] p-3">
                        <p>Completed Session Array</p>
                        <pre className=" ">{JSON.stringify(completedSessions, null, 1)}</pre>
                      </div>
                    </div>
                  )
                }
      </div>


      <div className="flex flex-row gap-6">

        {/* MAINTIMESCRUB */}
        <div className="w-1/4 border-[1px] p-3 rounded-md bg-gray-900">
          <MainTimeScrub/>
        </div>



        {/* TIMELINE SCRUB */}
        <div className="w-3/4 grow px-6 py-6 border-[1px] rounded-md bg-gray-900 flex flex-col justify-between">

          {/* SESSION INDICES and DEFAULT SETTINGS */}
          <div className="flex flex-row gap-4 h-2 my-6">
            
            {/* SESSION INDICES */}
            {Array.from({length: defaultSessionAmount}, () => 0).map((item, index) => (
              <div key={index} 
                className={`min-h-full transition-all duration-500 ease-in-out ` 
                  + `${startCount && index == sessionIndex ? ` animate-undulate ` : ` `}`
                } 
                style={{
                  width: `calc(1/${globalDefaults.defaultSessionAmount} * 100%)` ,
                  backgroundColor: index < sessionIndex ? 'var(--color-amber-400)' : (index === sessionIndex && useRest) ? 'var(--color-green-400)' : (index === sessionIndex && !useRest) ? 'var(--color-amber-200)' : 'white'
                }}>
              </div>
            ))}


            {/* DEFAULT SETTINGS */}
            <div className="flex flex-row items-center">
              <MainModal ref={settingsRef} id='settings-modal' title='Default Settings' triggerText="Defaults">
                <div className="flex flex-col gap-10 my-12">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xl">Default Work Duration: { defaultWorkDuration } Minutes</p>
                    </div>
                    <MainTimeSlider
                        useColor='var(--color-gray-500)'
                        useValue={defaultWorkDuration}
                        onChangeCallback={(e) => {
                          updateGlobalDefaults({defaultWorkDuration:e})
                          handleTentativeSessionsChange(e, 'default-work')
                        }}
                        />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xl">Default Rest Duration: { defaultRestDuration } Minutes</p>
                    </div>
                    <MainTimeSlider
                        useColor='var(--color-gray-500)'
                        useValue={defaultRestDuration}
                        onChangeCallback={(e) => {
                          updateGlobalDefaults({defaultRestDuration:e})
                          handleTentativeSessionsChange(e, 'default-break')
                        }}
                        />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xl">Default Number of Sessions: { defaultSessionAmount }</p>
                    </div>
                    <div>
                      <MainTimeSlider
                        useColor='var(--color-gray-500)'
                        useValue={defaultSessionAmount}
                        customMax={8}
                        customMin={3}
                        onChangeCallback={(e) => {
                          updateGlobalDefaults({defaultSessionAmount:e})
                        }}
                        />
                    </div>
                  </div>
                </div>
              </MainModal>
            </div>


          </div>


          {/* FOCUS BOX */}
          <div className="min-h-24 min-w-full">
            {
              beginFocus && (
                <div>
                  <p className="text-4xl font-black" id="focus-title">{useFocusTitle}</p>
                </div>
              )
            }
            {
              !beginFocus && (
                <MainInputText onChangeHandler={onTitleChangeHandler} label="Task to focus on"/>
              )
            }
          </div>


          {/* MAIN TIME SLIDER */}
          <div className="">
            <div className="flex flex-row p-2 mb-12 justify-between">
              <p className={`text-8xl cursor-default select-none font-black leading-20 overflow-hidden text-ellipsis transition-all duration-100 ease-in-out`}>
                <span 
                  className={
                    sessionType === 'break' ? 
                    ` text-green-400 text-shadow-green-200 hover:text-green-200 ` : 
                    ` text-amber-400 text-shadow-amber-200 hover:text-amber-200 ` 
                    + ` text-shadow-sm hover:text-shadow-md transition-all duration-200 ease-in-out `
                  }
                >
                      { sessionType === 'break' ? 'Rest for ' : 'Work for ' }
                    </span><br></br>{ seconds } Minutes </p>
            </div>
            <MainTimeSlider
              useColor={sessionType === 'break' ? 'var(--color-green-400)' : 'var(--color-amber-400)'}
              useValue={seconds}
              onChangeCallback={(e) => {
                updateGlobalTracker({sessionDuration: e})
                handleTentativeSessionsChange(e, 'session')
              }}
            />
          </div>

          {/* TIME SLIDER BUTTONS */}
          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-6">
              {
                startCount &&
                <MainButton onClickHandler={finishSessionEarly} buttonType="default">
                    FINISH SESSION EARLY
                </MainButton>
              }
              {
                !startCount &&
                <MainButton onClickHandler={startFocusHandler} buttonType="default">
                    {
                      beginFocus ? 'CONTINUE SESSION' : 'BEGIN FOCUS'
                    }
                </MainButton>
              }
              {
                beginFocus &&
                <MainButton onClickHandler={cleanFocusHandler} buttonType="bordered">
                    CLEAR FOCUS
                </MainButton>
              }
            </div>
            {
              beginFocus && (
                <div>
                  <MainModal ref={modalRef} id='text-modal' title='Write your Examen' triggerText="RECORD FOCUS">
                    <div className="mt-24 flex flex-col">
                      <MainInputText
                        onChangeHandler={onJournalChangeHandler}
                        type="textarea"/>
                      <div className="flex flex-row">
                        {
                          !useLoadingPosting && (
                            <div className="w-xs">
                              <MainButton
                                onClickHandler={recordFocusHandler} buttonType="default">
                                  POST
                              </MainButton>
                            </div>
                          )
                        } {
                          useLoadingPosting && (
                            <div className="my-2 p-4 font-black">
                              <p>LOADING</p>
                            </div>
                          )
                        }
                    </div>
                    </div>
                  </MainModal>
                </div>
              )
            }
          </div>
        </div>



        {/* ENTRIES LIST */}
        <div className="w-1/4 pb-3 border-[1px] rounded-md bg-gray-900 hidden ">
          <Entries/>
        </div>
      </div>



    </>
  )
}
