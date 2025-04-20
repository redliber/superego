'use client'
import { ChangeEvent, ReactEventHandler, useEffect, useMemo, useState } from "react";
import { useCounter } from "@uidotdev/usehooks";
import { addInterval, subInterval, subTime } from "@/app/lib/utils";
import { DateTime } from "luxon";

import MainButton from "../MainUIs/MainButton";
import MainTimeSlider from "../MainUIs/MainTimeSlider";
import MainInputText from "../MainUIs/MainInputText";

export default function AddEntry() {
  const [beginFocus, setBeginFocus] = useState(false)

  const [initDuration, setInitDuration] = useState(25)
  const [useDuration, setDuration] = useState(25)
  const [startCount, setStartCount] = useState(false)
  // Use M instead of S when finished with debugging
  const [useDeadline, setDeadline] = useState('')
  const [useDifference, setDifference] = useState(useDuration)
  const [useTime, setTime] = useState(subTime(useDeadline, DateTime.now().toISO()))

  const [useSessionAmt, setSessionAmt] = useState(5)
  const [useSessionIndex, setSessionIndex] = useState(0)
  const [useRest, setRest] = useState(false)
  const [useSliderColor, setSliderColor] = useState('var(--color-amber-400)')

  const [useFocusTitle, setFocusTitle] = useState('')


  

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
  })

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

  useEffect(() => {
    if (useSessionIndex <= 0 && !startCount) {
      setInitDuration(useDuration)
    } else {
      setBeginFocus(true)
    }
  })

  function startFocusHandler () {
    setStartCount(true)
    setDeadline(addInterval(new Date().toISOString(), `PT${useDuration}S`))
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

  return (
    <>
      <div className="flex flex-wrap mb-10 font-thin text-sm">
        <p>Current Time  <span className="px-10 font-black">{DateTime.now().toLocaleString()}</span> || &emsp;&emsp;</p>
        <p>Deadline  <span className="px-10 font-black">{useDeadline}</span> || &emsp;&emsp;</p>
        <p>Time Left  <span className="px-10 font-black">{String(useTime)}</span> || &emsp;&emsp;</p>
        <p>Difference  <span className="px-10 font-black">{useDifference}</span> || &emsp;&emsp;</p>
        <p>Session Index  <span className="px-10 font-black">{useSessionIndex}</span> || &emsp;&emsp;</p>
        <p>Session Type  <span className="px-10 font-black">{useRest ? 'Rest' : 'Work'}</span> || &emsp;&emsp;</p>
        <p>Duration Default  <span className="px-10 font-black">{initDuration}</span> || &emsp;&emsp;</p>
        <p>Begin Focus  <span className="px-10 font-black">{String(beginFocus)}</span> || &emsp;&emsp;</p>
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
              <p className="text-4xl font-black">{useFocusTitle}</p>
            </div>
          ) 
        }
        {
          !beginFocus && (
            <MainInputText onChangeHandler={onChangeHandler} label="Task to focus on"/>
          )
        }
      </div>
      <MainTimeSlider useRest={useRest} useDuration={useDuration} onChangeCallback={setDuration}/>
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
          <MainButton onClickHandler={cleanFocusHandler} buttonType="bordered">
              RECORD FOCUS
          </MainButton>
        </div>
      </div>
    </>
  )
}
