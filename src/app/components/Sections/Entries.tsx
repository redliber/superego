'use client'
import { formatInterval, formatTimestamp } from "@/app/lib/utils"
import { useEffect, useState } from "react"
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Entries() {
  const [allEntries, setAllEntries] = useState<any>()
  const [loading, setLoading] = useState<boolean>(true)

  const { data, error, mutate,  } = useSWR("/api/entry", fetcher);

  useEffect(() => {
    async function fetchEntry() {
      try {
        setLoading(true);
        const response = await fetch(`/api/entry`, {
          next: {tags: ['entries']}
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch entry: ${response.statusText}`);
        }
        const data = await response.json();
        setAllEntries(data);
      } catch (err) {
        // setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchEntry()
  }, [ ])

  return (
    <div className="w-full px-10 py-20 flex flex-col">
      <div className="w-full text-2xl font-bold flex flex-col gap-20 hidescrollbar overflow-y-scroll max-h-[50vh]">
        { data &&
          data.map((entry:any) => (
            <div key={entry.id} className="">
              <p>{ entry.entryName }</p>
              <p>Efficiency - { entry.entryEfficiency }</p>
              <p>{formatTimestamp(entry.entryTime)}</p>
              <p>{ entry.entryJournal }</p>
              {/* <div className="font-thin text-sm">
                {entry &&
                  entry.sessions.map(async (session: any) => {
                    const sessionData:any = await getSessionByID(session.id)
                    return (
                      <div key={session.id} className="flex flex-col gap-4">
                        {
                          sessionData.map((sessionEntry: any) => (
                            <div key={sessionEntry.id} className="flex flex-col my-4">
                              <p>Session Index : { sessionEntry.sessionIndex }</p>
                              <p>Session Time : { formatTimestamp(sessionEntry.sessionTime) }</p>
                              <p>Session Duration : { formatInterval(sessionEntry.sessionDuration) }</p>
                              <p>Session Work : { JSON.stringify(sessionEntry.sessionWork)  }</p>
                            </div>
                          ))
                        }
                      </div>
                    )
                  })
                }
              </div> */}
            </div>
          ))
        }
      </div>
      <div className="w-full font-thin font-mono text-sm overflow-y-scroll hidescrollbar max-h-[50vh]">
        <pre className="wrap">
          {
            JSON.stringify(data, null, 2)
          }
        </pre>
      </div>
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
  )
}
