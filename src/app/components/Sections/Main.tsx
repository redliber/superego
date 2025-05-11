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
  localStorage.setItem('defaultDuration', '0')
  localStorage.setItem('defaultRest', '0')

  // LOCALSTORAGE
  const [useEntryObject, setEntryObject] = useState<EntryObject | null>(null)
  const [useSessionsArray, setSessionsArray] = useState<SessionObject[]>([])

  const [beginFocus, setBeginFocus] = useState(false)
  const [startCount, setStartCount] = useState(false)
  const [initDuration, setInitDuration] = useState(Number(localStorage.getItem('defaultDuration'))>0 ? Number(localStorage.getItem('defaultDuration')) : 25)

  const [useDuration, setDuration] = useState(initDuration)
  const [useRestDuration, setRestDuration] = useState(Number(localStorage.getItem('defaultRest'))>0 ? Number(localStorage.getItem('defaultRest')) : 10)
  const [useDeadline, setDeadline] = useState('')
  const [useDifference, setDifference] = useState(useDuration)
  const [useTime, setTime] = useState(subTime(useDeadline, DateTime.now().toISO()))


  // SESSION TRACKING
  const [useSessionAmt, setSessionAmt] = useState(5)
  const [useSessionIndex, setSessionIndex] = useState(0)
  const [useRest, setRest] = useState(false)

  // JOURNALING
  const [useFocusTitle, setFocusTitle] = useState('')
  const [useFocusJournal, setFocusJournal] = useState('')

  const modalRef = useRef(null)
  const settingsRef = useRef(null)
  const [useLoadingPosting, setLoadingPosting] = useState(false)

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
        setDuration(useTime)
      }

      return () => clearInterval(interval)
    } else {
      setTime(useDuration)
    }
  }, [startCount, useDuration, useTime])

  // Logic for Finishing a Session
  useEffect(() => {
    if (useTime == 0) {
      if (!useRest) {
        if (startCount) {
          setSessionIndex(useSessionIndex + 1)
        }
        setStartCount(false)
        setTime(useRestDuration)
        setDuration(useRestDuration)
        setRest(true)
      } else if (useRest) {
        setStartCount(false)
        setTime(initDuration)
        setDuration(initDuration)
        setRest(false)
      }
    }
  })

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
    setDeadline(addInterval(new Date().toISOString(), `PT${useDuration}S`)) // Use M instead of S when finished with debugging

    const currentSession : SessionObject = {
      sessionIndex: useSessionIndex,
      sessionTime: parseTimeZoneBeforePOST(DateTime.now().toISO()),
      sessionDuration: String(useDuration),
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

  return (
    <>



      {/* <div className="flex flex-wrap mb-10 font-thin text-sm">
        <p>Current Time  <span className="px-10 font-black">{DateTime.now().toLocaleString()}</span> || &emsp;&emsp;</p>
        <p>Deadline  <span className="px-10 font-black">{useDeadline}</span> || &emsp;&emsp;</p>
        <p>Time  <span className="px-10 font-black">{String(useTime)}</span> || &emsp;&emsp;</p>
        <p>Difference  <span className="px-10 font-black">{useDifference}</span> || &emsp;&emsp;</p>
        <p>Duration  <span className="px-10 font-black">{useDuration}</span> || &emsp;&emsp;</p>
        <p>Session Index  <span className="px-10 font-black">{useSessionIndex}</span> || &emsp;&emsp;</p>
        <p>Session Type  <span className="px-10 font-black">{useRest ? 'Rest' : 'Work'}</span> || &emsp;&emsp;</p>
        <p>Duration Default  <span className="px-10 font-black">{initDuration}</span> || &emsp;&emsp;</p>
        <p>Begin Focus  <span className="px-10 font-black">{String(beginFocus)}</span> || &emsp;&emsp;</p>
        <p>Start Count  <span className="px-10 font-black">{String(startCount)}</span> || &emsp;&emsp;</p>
        <p>Entry Object  <span className="px-10 font-black overflow-hidden text-ellipsis">{String(JSON.stringify(useEntryObject))}</span> || &emsp;&emsp;</p>
      </div> */}

      {/* <div>
        <p>{JSON.stringify(serverEntries?.data)}</p>
      </div> */}


      <div className="flex flex-row gap-6">
        <div className="w-1/4 border-[1px] p-3 rounded-md bg-gray-900">
          <MainTimeScrub
            workDuration={useDuration}
            restDuration={useRestDuration}
            sessionAmount={useSessionAmt}
          />
        </div>

        <div className="w-3/4 grow px-6 py-6 border-[1px] rounded-md bg-gray-900 flex flex-col justify-between">
          <div className="flex flex-row gap-4 h-2 my-6">
            {[...Array(useSessionAmt)].map((item, index) => (
              <div key={index} className="min-h-full w-1/5 " style={{
                backgroundColor: index < useSessionIndex ? 'var(--color-amber-400)' : 'white'
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
                      <MainInputText label="Default" onChangeHandler={setSessionAmt}/>
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
              <p className="text-8xl font-black leading-20 overflow-hidden text-ellipsis"><span style={{color: useRest ? 'var(--color-green-400)' : 'var(--color-amber-400)'}}>{ useRest ? 'Rest for ' : 'Work for ' }</span><br></br>{ useDuration } Minutes </p>
            </div>
            <MainTimeSlider
              useColor={useRest ? 'var(--color-green-400)' : 'var(--color-amber-400)'}
              useValue={useDuration}
              onChangeCallback={setDuration}
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

        <div className="w-1/4 pb-3 border-[1px] rounded-md bg-gray-900">
          <Entries/>
        </div>
      </div>



    </>
  )
}
