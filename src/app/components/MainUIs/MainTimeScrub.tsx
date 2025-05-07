'use client'

import { fitRange } from "@/app/lib/utils"
import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useTime, useTimer } from "react-timer-hook"

const PLACEHOLDERDATA = [
    {start: `13:30`, end: `14:30`},
    {start: `15:00`, end: `16:00`},
    {start: `16:30`, end: `18:00`},
    {start: `18:11`, end: `19:03`},
    {start: `19:10`, end: `20:00`},
    {start: `20:04`, end: `20:10`},
]

const TIME_START = 5
const TIME_END = 24
const timeArray:number[] = []

for(let i = TIME_START; i <= TIME_END; i++) {
    timeArray.push(i)
}

const BLOCK_HEIGHT = 100
const TRUE_TIMEBLOCKS_HEIGHT = 100*timeArray.length

function fitTime (time:number) {
    return Number(fitRange(time, TIME_START, TIME_END + 1, 0, 1)) * TRUE_TIMEBLOCKS_HEIGHT
}

export default function MainTimeScrub() {
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
        <div className="border-[1px] border-t-0 rounded-sm rounded-t-none w-full overflow-y-scroll relative overflow-x-hidden hidescrollbar flex flex-col  z-[60]"
            style={{
                height: `${maxHeight}vh`
            }}
        >
            <div id="needlepin" className="min-h-0.5 bg-amber-50 absolute z-40 w-full place-self-end place-items-end "
                style={{
                    top: `${useCurrent}px`
                }}
            ></div>

            {
                PLACEHOLDERDATA.map((item, index) => {
                    return (
                        <EventBlock key={index} start={item.start} end={item.end}/>
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
    )
}

function EventBlock({start, end} : {start:string, end:string}) {
    const { hour:startHour, minute:startMinute } = DateTime.fromISO(start).toObject()

    const { hour:endHour, minute:endMinute } = DateTime.fromISO(end).toObject()
    // console.log(startTime)

    const startTime = fitTime(startHour! + startMinute!/60)
    const endTime = fitTime(endHour! + endMinute!/60)

    const height = endTime - startTime
    return (
        <div className="absolute w-[90%] p-2 text-black z-30 hover:bg-amber-300 transition-all duration-200 bg-amber-500 place-self-end"
            style={{
                top: `${startTime}px`,
                height: `${height}px`
            }}
        >
            <p className="font-mono font-bold">{start} - {end}</p>

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