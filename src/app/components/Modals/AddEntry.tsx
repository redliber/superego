'use client'
import { useEffect, useMemo, useState } from "react";
import { useCounter } from "@uidotdev/usehooks";
import { addInterval, subInterval, subTime } from "@/app/lib/utils";
import { DateTime } from "luxon";

import MainButton from "../MainUIs/MainButton";
import MainTimeSlider from "../MainUIs/MainTimeSlider";
import MainInputText from "../MainUIs/MainInputText";

export default function AddEntry() {
  const [useDuration, setDuration] = useState(25)
  const [startCount, setStartCount] = useState(false)
  // Use M instead of S when finished with debugging
  const [useDeadline, setDeadline] = useState('')
  const [useDifference, setDifference] = useState(useDuration)
  const [useTime, setTime] = useState(subTime(useDeadline, DateTime.now().toISO()))

  function onClickHandle () {
    setStartCount(true)
    setDeadline(addInterval(new Date().toISOString(), `PT${useDuration}S`))
  }
  

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
      setStartCount(false)
      setTime(useDuration)
    }
  })



  return (
    <>
      <div className="flex flex-col ">
        <p>Current Time  {DateTime.now().toLocaleString()}</p>
        <p>Deadline  {useDeadline}</p>
        <p>Time Left  {useTime}</p>
        <p>Difference  {useDifference}</p>
      </div>
      <MainTimeSlider useDuration={useDuration} onChangeCallback={setDuration}/>
      <MainInputText label="Task to focus on"/>
      <MainButton onClickHandler={onClickHandle}>
          START FOCUS
      </MainButton>
    </>
  )
}
