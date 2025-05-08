'use client'

import { fitRange } from "@/app/lib/utils"
import { DateTime, Duration } from "luxon"
import { useEffect, useState } from "react"
import { useTime, useTimer } from "react-timer-hook"
import useSWR, { useSWRConfig } from "swr"
import type { SessionObject, EntryObject } from "@/app/lib/types"

const PLACEHOLDERDATA = [
    {start: `13:30`, end: `14:30`},
    {start: `15:00`, end: `16:00`},
]

const TIME_START = 5
const TIME_END = 24
const timeArray:number[] = []

for(let i = TIME_START; i <= TIME_END; i++) {
    timeArray.push(i)
}

const BLOCK_HEIGHT = 200
const TRUE_TIMEBLOCKS_HEIGHT = BLOCK_HEIGHT*timeArray.length

function fitTime (time:number) {
    return Number(fitRange(time, TIME_START, TIME_END + 1, 0, 1)) * TRUE_TIMEBLOCKS_HEIGHT
}
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function MainTimeScrub() {
    const { cache, mutate } = useSWRConfig()
    const serverEntries = cache.get("/api/entry")
    
    const dateNow = DateTime.now()
    const [useDate, setDate] = useState({
        year: DateTime.now().year,
        month: DateTime.now().month,
        monthString: DateTime.now().monthLong,
        day: DateTime.now().day,
    })
    
    const { data:sessionData, isLoading:loadingSession } = useSWR(`/api/session?sessionTime=${useDate.year}-${useDate.month}-${useDate.day}`, fetcher)
    const [useSessions, setSessions] = useState([])

    useEffect(() => {
        if (!loadingSession) {
            const sessionsArr = sessionData.map((item:SessionObject) => {
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
    } , [loadingSession])

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



    
    return (
        <>
            <div>
                <div className="flex flex-row justify-between align-top items-start bg-zinc-950 sticky z-50 top-0 px-2 pb-2 w-full " 
                    style={{
                        // height: `${HEADER_HEIGHT}px`
                    }}
                >
                    <div>
                        <p>{`←`}</p>
                    </div>
                    <div>
                        <p> {useDate.monthString} {useDate.day} {useDate.year}</p>
                        {/* <p> {JSON.stringify(useSessions)} </p> */}
                    </div>
                    <div>
                        <p>{`→`}</p>
                    </div>
                </div>
            </div>
            <div className=" w-full overflow-y-scroll relative overflow-x-hidden hidescrollbar flex flex-col  z-[60]"
                style={{
                    height: `${maxHeight}vh`
                }}
            >
                {/* <p>{JSON.stringify(serverEntries?.data)}</p> */}
                {/* <p>{JSON.stringify(useDate)}</p> */}

                
                <div id="needlepin" className="min-h-0.5 bg-amber-50 absolute z-40 w-full place-self-end place-items-end "
                    style={{
                        top: `${useCurrent}px`
                    }}
                ></div>

                {
                    useSessions && useSessions.map((item: any, index) => {
                        return (
                            <EventBlock key={index} start={item.start} end={item.end} type={item.type}/>
                        )
                    })
                }


                <div className="-z-50">
                    {
                        timeArray.map((item, index) => {
                            return (
                                <TimeBlock key={index} time={item}/>
                            )
                        })
                    }
                </div>

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
        <div className={`absolute w-[90%] px-1 text-black z-30  transition-all duration-200 place-self-end` + colors
        }
            style={{
                top: `${startTime}px`,
                height: `${height}px`,
                // background: type ==='work' ? 'var(--color-amber-500)' : 'var(--color-green-500)' 
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
            <div className="w-[10%] px-2 text-right ">
                <p>{time}</p>
            </div>
            <div className="w-[90%] bg-zinc-900 border-l-[0.1px] border-l-amber-100/50">

            </div>

        </div>
    )
}