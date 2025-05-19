'use client'

import { fitRange } from "@/app/lib/utils"
import { DateTime, Duration } from "luxon"
import { SetStateAction, useEffect, useRef, useState } from "react"
import { useTime, useTimer } from "react-timer-hook"
import useSWR, { useSWRConfig } from "swr"
import type { SessionObject, EntryObject, TentativeSessionObject } from "@/app/lib/types"
import useGlobalSessions from "@/app/states/useGlobalSessions"

const PLACEHOLDERDATA = [
    {start: `13:30`, end: `14:30`},
    {start: `15:00`, end: `16:00`},
]

const TIME_START = 0
const TIME_END = 24
const timeArray:number[] = []

for(let i = TIME_START; i <= TIME_END; i++) {
    timeArray.push(i)
}

const BLOCK_HEIGHT = 250
const TRUE_TIMEBLOCKS_HEIGHT = BLOCK_HEIGHT * timeArray.length

function fitTime (time:number) {
    return Number(fitRange(time, TIME_START, TIME_END + 1, 0, 1)) * TRUE_TIMEBLOCKS_HEIGHT
}
const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface SelectedDate {
  year: number,
  month: number,
  monthString: string,
  day: number
}

interface MainTimeScrubArgument {

  sessionIndex: number,
}

// ==========================================================================================
// ==========================================================================================
//                                  MAIN REACT EXPORT
// ==========================================================================================
// ==========================================================================================

export default function MainTimeScrub() {
    const { cache, mutate } = useSWRConfig()

    const { state, updateState } = useGlobalSessions()
    const { beginFocus, startCount, tentativeSessions} = state

    const serverEntries = cache.get("/api/entry")

    const dateNow = DateTime.now()
    const [useDate, setDate] = useState<SelectedDate>({
        year: DateTime.now().year,
        month: DateTime.now().month,
        monthString: DateTime.now().monthLong ?? "Unknown",
        day: DateTime.now().day,
    })

    const checkIfCurrentDay = dateNow.hasSame(DateTime.fromObject(
      {year: useDate.year, month:useDate.month, day:useDate.day}
    ), 'day')

    function adjustDate(adjustment: "increment" | "decrement" | "today") {
      if (adjustment === 'today') {
        setDate({
          year: DateTime.now().year,
          month: DateTime.now().month,
          monthString: DateTime.now().monthLong ?? "Unknown",
          day: DateTime.now().day,
        })
      } else {
        setDate((prevDate) => {
          // Create a Luxon DateTime object from the current state
          const currentDate = DateTime.fromObject({
            year: prevDate.year,
            month: prevDate.month,
            day: prevDate.day,
          });

          // Adjust the date based on the adjustment parameter
          const newDate =
            adjustment === "increment"
              ? currentDate.plus({ days: 1 })
              : adjustment === "decrement"
              ? currentDate.minus({ days: 1 })
              : currentDate;

          // Return the updated state
          return {
            year: newDate.year,
            month: newDate.month,
            monthString: newDate.monthLong ?? 'unknown',
            day: newDate.day,
          };
        });
      }
    }

    const scrollContainerRef = useRef<HTMLDivElement>(null)
    function scrollToToday () {
      adjustDate('today')
      setTimeout(() => {
          if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollTo({
                  top: useCurrent - (maxHeight * window.innerHeight) / 400, // Center needlepin
                  behavior: "smooth",
              })
          }
      }, 0)
    }

    // Fetching sessionData from the api route and assigning each events into the useSessions state.

    const queryParam = `${useDate.year}-${String(useDate.month).padStart(2, "0")}-${String(useDate.day).padStart(2, "0")}`
    const { data:sessionData, isLoading:loadingSession } = useSWR(`/api/session?sessionTime=${queryParam}`, fetcher)
    const [useSessions, setSessions] = useState([])

    useEffect(() => {
      if (sessionData) {
        const sessionsArr:any = sessionData!.map((item:SessionObject) => {
          const startTime = DateTime.fromISO(String(item.sessionTime), { zone: 'utc' })
          const startHour = startTime.hour.toString().padStart(2, '0')
          const startMinute = startTime.minute.toString().padStart(2, '0')
          const startTimeObject = `${startHour}:${startMinute}`

          const duration = startTime.plus(Duration.fromISO(item.sessionDuration))
          const endHour = duration.hour.toString().padStart(2, '0')
          const endMinute = duration.minute.toString().padStart(2, '0')
          const endTimeObject = `${endHour}:${endMinute}`

          console.log({start: startTimeObject, end: endTimeObject, type: item.sessionType});

          return {start: startTimeObject, end: endTimeObject, type: item.sessionType}
        })
        setSessions(sessionsArr)
      }
      // The array to check is both useDate and loadingSession.
    } , [useDate, loadingSession])


    useEffect(() => {
        if (serverEntries?.data) {
            const selectedDayEntries = serverEntries.data.filter((item:EntryObject, index:number) => {
                const entryTime = DateTime.fromISO(String(item.entryTime)).toISODate()
                const selectedDate = DateTime.fromObject({year:useDate.year, month: useDate.month, day:useDate.day}).toISODate()

                // const {data, error} = useSWR(`/api/session?id=${item.id}`, fetcher)
                // console.log(`Session Object --> ${data}`);
                // console.log(`selectedDate`, selectedDate);
                // console.log(`entryTime`, entryTime);
                return entryTime == selectedDate
            })
            // console.log(`selectedDayEntries`, selectedDayEntries);
        }

    }, [serverEntries])


    // Setting Current Position of the Needlepin
    const {
        milliseconds,
        seconds,
        minutes,
        hours,
      } = useTime();

    const [useCurrent, setCurrent] = useState<number>(0)
    const maxHeight = 60
    useEffect(() => {
        const current = hours + minutes/60
        const fitted = fitTime(current)
        setCurrent(fitted)
    }, [minutes, hours, seconds])

    const [useDebug, setDebug] = useState(true)


    return (
        <>

            {/* DEBUGGING AREA */}
            <div className="fixed top-0 right-0 p-4 w-xl  hidescrollbar flex flex-col gap-4 overflow-hidden">
              <div className="cursor-pointer hover:font-black" onClick={() => setDebug(!useDebug)}>MainTimeScrub Debug</div>
              {
                useDebug && (

                    <div className=" bg-gray-600 h-[400px] flex flex-col overflow-y-scroll p-6 ">
                      <div className="flex flex-col gap-2 my-4 border-[1px] p-3">
                        <p className="font-black">tentativeSessions</p><pre>{JSON.stringify(tentativeSessions, null, 1)}</pre>
                      </div>
                    </div>

                )
              }


            </div>

            {/* TOP SECTION */}
            <div>
                <div className="flex flex-row justify-between align-top items-start bg-gray-900 sticky z-50 top-0 px-2 pb-2 w-full text-xs "
                    style={{
                        // height: `${HEADER_HEIGHT}px`
                    }}
                >
                    <div className="cursor-pointer hover:text-amber-200 active:text-amber-500" onClick={() => adjustDate('decrement')}>
                        <p>{`←`}</p>
                    </div>
                    <div>
                      {
                        checkIfCurrentDay &&
                        <p className="text-amber-200"> {useDate.monthString} {useDate.day} {useDate.year}</p>
                      }
                      {
                        !checkIfCurrentDay &&
                        <p className=""> {useDate.monthString} {useDate.day} {useDate.year}</p>
                      }
                        {/* <p> {JSON.stringify(useSessions)} </p>
                        <p> {JSON.stringify(useDate)} </p>
                        <p> {queryParam} </p> */}
                    </div>
                    <div className="cursor-pointer hover:text-amber-200 active:text-amber-500" onClick={() => adjustDate('increment')}>
                        <p>{`→`}</p>
                    </div>
                </div>
            </div>


            {/* MAIN SECTION */}
            <div
                ref={scrollContainerRef}
                className=" w-full overflow-y-scroll relative overflow-x-hidden hidescrollbar flex flex-col  z-[60]"
                style={{
                    height: `${maxHeight}vh`
                }}
            >
                {/* <p>{JSON.stringify(serverEntries?.data)}</p> */}
                {/* <p>{JSON.stringify(useDate)}</p> */}


                {/* Needle Pin */}
                {
                  checkIfCurrentDay &&
                  <div id="needlepin" className="h-0.5 bg-amber-50 absolute z-40 w-full place-self-end place-items-end "
                      style={{
                          top: `${useCurrent}px`
                      }}
                  ><p className="text-white font-black text-xs place-self-start py-1">{useCurrent.toFixed(2)}</p></div>
                }


                {/* Event Blocks, if available */}
                {
                    useSessions && useSessions.map((item: any, index) => {
                        return (
                            <EventBlock key={index} start={item.start} end={item.end} type={item.type}/>
                        )
                    })
                }


                {/* Time Blocks, Background */}
                <div className="-z-50">
                    {
                        timeArray.map((item, index) => {
                            return (
                                <TimeBlock key={index} time={item}/>
                            )
                        })
                    }
                </div>


                {/* Tentative Blocks */}
                {
                  checkIfCurrentDay &&
                  <div id="tentative-outer" className=" w-full absolute top-0 overflow-hidden "
                    style={{
                        height: `${TRUE_TIMEBLOCKS_HEIGHT}px`,
                    }}
                  >
                    <TentativeArea
                      useCurrent={useCurrent}
                      />
                  </div>

                }

                {/* Hiding Scrollbar */}
                <style jsx>
                    {`
                        .hidescrollbar {
                            scrollbar-width: none;
                        }
                        .hidescrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}
                </style>
            </div>


            {/* BOTTOM SECTION */}
            <div id="scroll-to-today" onClick={scrollToToday} className="flex flex-row justify-end bg-gray-900 sticky bottom-0 px-2 pt-2 w-full hover:text-amber-300 transition-all duration-150 cursor-pointer">
                <p className="text-center text-xs">Go to Now</p>
            </div>
        </>
    )
}

function EventBlock({start, end, type} : {start:string, end:string, type?:string}) {
    const { hour:startHour, minute:startMinute } = DateTime.fromISO(start).toObject()

    const { hour:endHour, minute:endMinute } = DateTime.fromISO(end).toObject()
    // console.log(startTime)

    const startTime = fitTime(startHour! + startMinute!/60)
    const endTime = fitTime(endHour! + endMinute!/60)

    const height = endTime - startTime

    const colors = type === "work" ? ' bg-amber-500 hover:bg-amber-300 ' : ' bg-green-500 hover:bg-green-300 '
    return (
        <div
            className={`absolute w-[90%] px-1 text-black z-30  transition-all duration-200 place-self-end` + colors}
            style={{
                top: `${startTime}px`,
                height: `${height}px`,
            }}
        >
            <p className=" ">{start} - {end}</p>

        </div>
    )
}

function TimeBlock({time}: {time:number}) {
    return (
        <div className="flex flex-row border-b-[0.1px] border-b-amber-100/50"
            style={{
                height: `${BLOCK_HEIGHT}px`
            }}
        >
            <div className="w-[10%] pr-2 ">
                <p>{time}</p>
            </div>
            <div className="w-[90%] bg-gray-800 border-l-[0.1px] border-l-amber-100/50">

            </div>

        </div>
    )
}

function TentativeArea({useCurrent} : {useCurrent:number}) {
  const { state, updateState } = useGlobalSessions()
  const { beginFocus, startCount, tentativeSessions, sessionIndex} = state

  // useEffect(() => {
  //   console.log(`tentativeSessions in TentativeArea ${JSON.stringify(tentativeSessions)}`);
  // }, [tentativeSessions])


  const [useTopPos, setTopPos] = useState<number>(0)

  useEffect(() => {
    if (beginFocus) {
      setTopPos(useCurrent)
    }
  }, [beginFocus])

  return (
    <div className=" flex flex-col justify-center absolute w-full overflow-hidden "
      style={{
          // height: `${maxHeight}vh`,
          top: `${beginFocus ? useTopPos : useCurrent}px`
      }}
      >
        <div className= " w-3/4 place-self-end rounded-b-sm overflow-clip h-full "
        >
          {
            tentativeSessions.map(({sessionDuration, sessionType}, index) => {
              return (
                  <TentativeBlock
                    key={index}
                    currentIndex={index}
                    parentPos={useTopPos}
                    sessionIndex={sessionIndex}
                    needlePinPos={useCurrent}
                    startCount={startCount}
                    duration={ sessionDuration }
                    type={ sessionType }
                    beginFocus={beginFocus}
                    />
              )
            })
          }
        </div>
    </div>
  )
}

function TentativeBlock({duration, type, sessionIndex, currentIndex, startCount, needlePinPos, parentPos, beginFocus} : {duration: number, type:string, sessionIndex:number, currentIndex:number, startCount:boolean, needlePinPos:number, parentPos:number, beginFocus:boolean}) {
  const tentativeBlockRef = useRef<HTMLDivElement>(null)

  const colors = type === "work" ? ' bg-amber-300/25 hover:bg-amber-500 ' : ' bg-green-300/25 hover:bg-green-500 '
  
  const offsetTop = tentativeBlockRef.current?.offsetTop 
  const absoluteTop = tentativeBlockRef.current?.getBoundingClientRect()
  
  const [useTop, setTop] = useState<string>(`auto`)
  const [useHeight, setHeight] = useState<number>(duration / 60 * BLOCK_HEIGHT)

  useEffect(() => {
    // if (startCount) setHeight(prev => prev)
    // else {
    //   if (currentIndex === sessionIndex) setHeight(duration / 60 * BLOCK_HEIGHT)
    // }

    setHeight(duration / 60 * BLOCK_HEIGHT)
  }, [startCount, sessionIndex, duration])

  return (
    <div
      ref={tentativeBlockRef}
      className={` w-full px-2 pt-1 text-xs transition-all overflow-clip duration-150 ease-in-out ` + colors}
      style={{
        height: `${useHeight}px`,
        top: useTop
      }}
    >
      <div className="flex flex-row gap-2 w-full justify-between">
        <div className="flex flex-row gap-2  w-1/2">
          <p className=" text-right">Current :</p>
          <p className=" text-left font-black">{currentIndex}</p>
        </div>
        <div className="flex flex-row gap-2  w-1/2">
          <p className=" text-right">Session :</p>
          <p className=" text-left font-black">{sessionIndex}</p>
        </div>
      </div>

      <div className="flex flex-row gap-1 w-full justify-between">
        <div className="flex flex-row gap-1  w-1/3">
          <p className=" text-right">Offset :</p>
          <p className=" text-left font-black">{offsetTop}</p>
        </div>
        <div className="flex flex-row gap-2  w-2/3">
          <p className=" text-right">Absolute :</p>
          <p className=" text-left font-black">{absoluteTop?.y.toFixed(2)}</p>
        </div>
      </div>

      
      <div className="flex flex-row">
        <p className="w-1/3 text-left">ParentPos :</p>
        <p className="w-2/3 text-left font-black">{parentPos.toFixed(2)}</p>
      </div>

      <div className="flex flex-row">
        <p className="w-1/3 text-left">Duration :</p>
        <p className="w-2/3 text-left font-black">{String(type).toWellFormed()} for { duration } Minutes</p>
      </div>
    </div>
  )
}
