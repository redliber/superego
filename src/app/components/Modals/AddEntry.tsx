'use client'
import { ChangeEvent, ReactEventHandler, useEffect, useMemo, useState } from "react";
import { useCounter } from "@uidotdev/usehooks";
import { addInterval, subInterval, subTime } from "@/app/lib/utils";
import { DateTime } from "luxon";

import MainButton from "../MainUIs/MainButton";
import MainTimeSlider from "../MainUIs/MainTimeSlider";
import MainInputText from "../MainUIs/MainInputText";
import { EntryObject, SessionObject } from "@/app/lib/types";

import useSWR, {useSWRConfig} from 'swr';




export default function AddEntry() {
  const { mutate } = useSWRConfig()


  const [beginFocus, setBeginFocus] = useState(false)
  const [useEntryObject, setEntryObject] = useState<EntryObject | null>(null)
  const [useSessionsArray, setSessionsArray] = useState<SessionObject[]>([])

  const [startCount, setStartCount] = useState(false)
  const [initDuration, setInitDuration] = useState(25)

  const [useDuration, setDuration] = useState(25)
  const [useDeadline, setDeadline] = useState('')
  const [useDifference, setDifference] = useState(useDuration)
  const [useTime, setTime] = useState(subTime(useDeadline, DateTime.now().toISO()))

  const [useSessionAmt, setSessionAmt] = useState(5)
  const [useSessionIndex, setSessionIndex] = useState(0)
  const [useRest, setRest] = useState(false)

  const [useFocusTitle, setFocusTitle] = useState('')

  useEffect(() => {
    if (beginFocus) {
      // Signifying the beginning of a Focus, saving the Focus Entry to `localStorage`. Saving `EntryObject` should only be for each beginnings of Focus.
      const newEntryObject = {
        entryTime: DateTime.now().toISO(),
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
        setTime(10)
        setDuration(10)
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
      sessionTime: DateTime.now().toISO(),
      sessionDuration: String(useDuration),
      sessionType: useRest ? 'rest' : 'work',
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
  }

  function onChangeHandler(e: ChangeEvent<HTMLInputElement>) {
    setFocusTitle(e.target.value)
  }

  async function recordFocusHandler() {
    if (useEntryObject) {
      // CAN'T BE USED IN A CLIENT COMPONENT BECAUSE WE'RE USING `createClient()` instead of `createHTTPClient()`
      // const entryObjectServer = createEntry(useEntryObject)
      await postEntry()

      useSessionsArray.forEach((item : SessionObject) => {
        // const newItem = {...item, sessionEntry: {id: entryObjectServer.id}}
      })
    }
  }

  function postFocusEntry() {

  }

  async function postEntry() {
    try {
      const response = await fetch('/api/entry', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(useEntryObject)
      })

      if (!response.ok) {
        throw new Error(`Failed to create entry: ${response.statusText}`);
      }

      mutate("/api/entry")

    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <div className="flex flex-wrap mb-10 font-thin text-sm">
        {/* <p>Current Time  <span className="px-10 font-black">{DateTime.now().toLocaleString()}</span> || &emsp;&emsp;</p> */}
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
      </div>
      <div className="flex flex-row gap-4 h-2 my-6">
        {[...Array(useSessionAmt)].map((item, index) => (
          <div key={index} className="min-h-full w-1/5" style={{
            backgroundColor: index < useSessionIndex ? 'var(--color-amber-400)' : 'white'
          }}>
          </div>
        ))}
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
            <MainInputText onChangeHandler={onChangeHandler} label="Task to focus on"/>
          )
        }
      </div>
      <MainTimeSlider
        useRest={useRest}
        useDuration={useDuration}
        onChangeCallback={setDuration}/>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-10">
          <MainButton onClickHandler={startFocusHandler} buttonType="default">
              START FOCUS
          </MainButton>
          <MainButton onClickHandler={cleanFocusHandler} buttonType="bordered">
              CLEAR FOCUS
          </MainButton>
        </div>
        <div>
          <MainButton onClickHandler={recordFocusHandler} buttonType="bordered">
              RECORD FOCUS
          </MainButton>
        </div>
      </div>
    </>
  )
}
