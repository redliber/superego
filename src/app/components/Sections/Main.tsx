'use client'
import { ChangeEvent, ReactEventHandler, useEffect, useMemo, useRef, useState } from "react";
import { useCounter } from "@uidotdev/usehooks";
import { addInterval, parseTimeZoneBeforePOST, subInterval, subTime } from "@/app/lib/utils";
import { DateTime } from "luxon";
import { useTime, useTimer } from "react-timer-hook"


import MainButton from "../MainUIs/MainButton";
import MainTimeSlider from "../MainUIs/MainTimeSlider";
import MainInputText from "../MainUIs/MainInputText";
import { EntryObject, SessionObject } from "@/app/lib/types";

import useSWR, {useSWRConfig} from 'swr';
import MainModal from "../MainUIs/MainModal";
import { Preahvihear } from "next/font/google";
import MainTimeScrub from "../MainUIs/MainTimeScrub";
import Entries from "./Entries";
import { Settings } from "lucide-react";




export default function Main() {
  const { cache, mutate } = useSWRConfig()

  const serverEntries = cache.get("/api/entry")

  // LOCALSTORAGE
  const [useEntryObject, setEntryObject] = useState<EntryObject | null>(null)
  const [useSessionsArray, setSessionsArray] = useState<SessionObject[]>([])

  const [beginFocus, setBeginFocus] = useState(false)
  const [startCount, setStartCount] = useState(false)

  const [initDuration, setInitDuration] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('defaultDuration');
      return stored && !isNaN(Number(stored)) ? Number(stored) : 25;
    }
    return 25; // Default value for server-side rendering
  });

  const [initRestDuration, setInitRestDuration] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('defaultRest');
      return stored && !isNaN(Number(stored)) ? Number(stored) : 10;
    }
    return 10; // Default value for server-side rendering
  });
  
  
  const [useDuration, setDuration] = useState(initDuration)
  const [useRestDuration, setRestDuration] = useState(initRestDuration)

  const [useDeadline, setDeadline] = useState('')
  const [useDifference, setDifference] = useState(useDuration)
  const [useTime, setTime] = useState(subTime(useDeadline, DateTime.now().toISO()))


  // SESSION TRACKING
  const [useSessionAmt, setSessionAmt] = useState(5)
  const [useSessionsLocalArray, setSessionsLocalArray] = useState<{}[]>([])
  const [useSessionIndex, setSessionIndex] = useState(0)
  const [useRest, setRest] = useState(false)

  // JOURNALING
  const [useFocusTitle, setFocusTitle] = useState('')
  const [useFocusJournal, setFocusJournal] = useState('')

  const modalRef = useRef(null)
  const settingsRef = useRef(null)
  const [useLoadingPosting, setLoadingPosting] = useState(false)

  // PLANNING SESSIONS
  useEffect(() => {
    const n = Math.max(1, Math.floor(useSessionAmt > 0 ? useSessionAmt : 1));
    const arr = Array.from({ length: n }, () => 0).map((item, index) => {

      const durationLookUp = (typeLookUp:string):number => {
        const findSessionIndexFromLocalStorage = useSessionsArray.find((item) => 
          item.sessionType === typeLookUp && item.sessionIndex === index
        )

        if (useSessionIndex === index) {
          if (!startCount) {
            return typeLookUp === 'work' ? useDuration : useRestDuration
          } else {
            return Number(findSessionIndexFromLocalStorage?.sessionDuration)
          }
        } else if (useSessionIndex < index) {
          return typeLookUp === 'work' ? initDuration : initRestDuration
        } else {
          return Number(findSessionIndexFromLocalStorage?.sessionDuration)
        }
      }

      const workObject = {
        sessionIndex: index,
        sessionType: 'work',
        sessionDuration: durationLookUp('work')
      }

      const restObject = {
        sessionIndex: index,
        sessionType: 'break',
        sessionDuration: durationLookUp('break')
      }

      const sessionArr = []
      if (index > 0) sessionArr.push(restObject)
      sessionArr.push(workObject)

      return sessionArr
    })
    setSessionsLocalArray(arr);
  }, [useSessionAmt, useSessionIndex, useRestDuration, useDuration])

  useEffect(() => {
    if (beginFocus) {
      // Signifying the beginning of a Focus, saving the Focus Entry to `localStorage`. Saving `EntryObject` should only be for each beginnings of Focus.
      const newEntryObject = {
        entryTime: parseTimeZoneBeforePOST(DateTime.now().toISO()),
        entryEfficiency: 0,
        entryJournal: '',
        entryName: useFocusTitle,
      };

      // Update state
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
        if (startCount) setSessionIndex(prev => prev + 1)
        setStartCount(false)
        setTime(initDuration)
        setDuration(initDuration)
        setRest(true)
    } else {
        setStartCount(false)
        setTime(initRestDuration)
        setDuration(initRestDuration)
        setRest(false)
      }
    }
  }, [useTime, useRest, startCount])

  // Logic for Default Durations and Beginning Focus for the First Time
  useEffect(() => {
    // When we haven't begun a Focus, the `InitDuration` default should be modifiable along with `useDuration`; However, when we've already started the Focus session, 'beginFocus' should be true.
    if (useSessionIndex <= 0 && !startCount) {
      setInitDuration(useDuration)
    } else {
      // When 'beginFocus' is true, the Input for Title will change to the actual Heading itself. Refer to <p> with id="focus-title".
      setBeginFocus(true)
    }
  }, [useSessionIndex, startCount, useDuration])



  function startFocusHandler () {
    setStartCount(true)
    setDeadline(addInterval(new Date().toISOString(), `PT${useRest ? useRestDuration : useDuration}S`)) // Use M instead of S when finished with debugging

    const currentSession : SessionObject = {
      sessionIndex: useSessionIndex,
      sessionTime: parseTimeZoneBeforePOST(DateTime.now().toISO()),
      sessionDuration: String(useRest ? useRestDuration : useDuration),
      sessionType: useRest ? 'break' : 'work',
    }

    // Signifying the beginning of a Session. Saving the Session entry into `localStorage`.
    setSessionsArray(prevSessions => [
      ...prevSessions,
      currentSession
    ])
    localStorage.setItem('SessionsArray', JSON.stringify([...useSessionsArray, currentSession]))
  }

  function cleanFocusHandler () {
    setBeginFocus(false)
    setSessionIndex(0)
    setDuration(initDuration)
    setTime(initDuration)
    setStartCount(false)
    setRest(false)
    setFocusTitle('')
    localStorage.removeItem('SessionsArray')
    localStorage.removeItem('EntryObject')
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

        await Promise.all(useSessionsArray.map(async (item : SessionObject) => {
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

  const [useDebug, setDebug] = useState(false)


  return (
    <>


      {/* DEBUGGING AREA */}
      <div className="fixed top-0 right-[40rem] p-4 h-[65vh] w-xl flex flex-col gap-4 ">
        <div className="cursor-pointer hover:font-black" onClick={() => setDebug(!useDebug)}>MainPage Debug</div>
                {
                  useDebug && (
                    <div className="flex flex-col mb-10 font-thin text-sm bg-gray-600 p-6 overflow-y-scroll">

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
                            <p>Duration Default</p>
                            <p className=" font-black">{initDuration}</p>
                          </div>
                          <div className="flex flex-row justify-between">
                            <p>Rest Duration Default</p>
                            <p className=" font-black">{initRestDuration}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col my-4 border-[1px] p-3">
                        <div className="flex flex-row justify-between">
                          <p>Current Session Index</p>
                          <p className=" font-black">{useSessionIndex}</p>
                        </div>
                        <div className="flex flex-row justify-between">
                          <p>Current Session Type</p>
                          <p className=" font-black">{useRest ? 'Rest' : 'Work'}</p>
                        </div>
                      </div>



                      <div className="flex flex-col my-4 border-[1px] p-3">
                        <p>Session Object</p>
                        <pre className=" ">{JSON.stringify(useSessionsArray, null, 1)}</pre>
                      </div>
                    </div>
                  )
                }
      </div>


      <div className="flex flex-row gap-6">
        <div className="w-1/4 border-[1px] p-3 rounded-md bg-gray-900">
          <MainTimeScrub
            workDuration={useDuration}
            restDuration={useRestDuration}
            sessionAmount={Number(useSessionAmt)}
            sessionIndex={useSessionIndex}
            startCount={startCount}
            beginFocus={beginFocus}
            localSessionsArray={useSessionsLocalArray}
          />
        </div>

        <div className="w-3/4 grow px-6 py-6 border-[1px] rounded-md bg-gray-900 flex flex-col justify-between">
          <div className="flex flex-row gap-4 h-2 my-6">
            {useSessionsLocalArray.map((item, index) => (
              <div key={index} 
                className={`min-h-full transition-all duration-500 ease-in-out ` 
                  + `${startCount && index == useSessionIndex ? ` animate-undulate ` : ` `}`
                } 
                style={{
                  width: `calc(1/${useSessionAmt} * 100%)` ,
                  backgroundColor: index < useSessionIndex ? 'var(--color-amber-400)' : (index === useSessionIndex && useRest) ? 'var(--color-green-400)' : (index === useSessionIndex && !useRest) ? 'var(--color-amber-200)' : 'white'
                }}>
              </div>
            ))}
            <div className="flex flex-row items-center">
              <MainModal ref={settingsRef} id='settings-modal' title='Default Settings' triggerText="Defaults">
                <div className="flex flex-col gap-10 my-12">
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xl">Default Work Duration: { useDuration } Minutes</p>
                    </div>
                    <MainTimeSlider
                        useColor='var(--color-gray-500)'
                        useValue={useDuration}
                        onChangeCallback={(e) => {
                          setDuration(e)
                          localStorage.setItem('defaultDuration', String(e))
                        }}
                        />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xl">Default Rest Duration: { useRestDuration } Minutes</p>
                    </div>
                    <MainTimeSlider
                        useColor='var(--color-gray-500)'
                        useValue={useRestDuration}
                        onChangeCallback={(e) => {
                          setRestDuration(e)
                          localStorage.setItem('defaultRest', String(e))
                        }}
                        />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-xl">Default Number of Sessions: { useSessionAmt }</p>
                    </div>
                    <div>
                      <MainInputText 
                        label="Default" 
                        onChangeHandler={(e) => {
                        setSessionAmt(e.target.value)}
                        }/>
                    </div>
                  </div>
                </div>
              </MainModal>
            </div>
          </div>


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

          <div className="">
            <div className="flex flex-row p-2 mb-12 justify-between">
              <p className={`text-8xl cursor-default select-none font-black leading-20 overflow-hidden text-ellipsis transition-all duration-100 ease-in-out`}>
                <span 
                  className={
                    useRest ? 
                    ` text-green-400 text-shadow-green-200 hover:text-green-200 ` : 
                    ` text-amber-400 text-shadow-amber-200 hover:text-amber-200 ` 
                    + ` text-shadow-sm hover:text-shadow-md transition-all duration-200 ease-in-out `
                  }
                >
                      { useRest ? 'Rest for ' : 'Work for ' }
                    </span><br></br>{ useRest ? useRestDuration : useDuration } Minutes </p>
            </div>
            <MainTimeSlider
              useColor={useRest ? 'var(--color-green-400)' : 'var(--color-amber-400)'}
              useValue={useRest ? useRestDuration : useDuration}
              onChangeCallback={(e) => useRest ? setRestDuration(e) : setDuration(e)}
            />
          </div>


          <div className="flex flex-row justify-between">
            <div className="flex flex-row gap-6">
              <MainButton onClickHandler={startFocusHandler} buttonType="default">
                  START FOCUS
              </MainButton>
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

        <div className="w-1/4 pb-3 border-[1px] rounded-md bg-gray-900 hidden ">
          <Entries/>
        </div>
      </div>



    </>
  )
}
