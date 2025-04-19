import { getAllEntries, getSessionByID } from "@/app/lib/db"
import { formatInterval, formatTimestamp } from "@/app/lib/utils"

export default async function Entries() {
  const allEntries = await getAllEntries()
  return (
    <div className="w-full px-10 py-20 flex flex-row">
      <div className="w-full text-2xl font-bold flex flex-col gap-20 overflow-y-scroll max-h-[50vh]">
        {
          allEntries.map((entry:any) => (
            <div key={entry.id} className="">
              <p>{ entry.entryName }</p>
              <p>Efficiency - { entry.entryEfficiency }</p>
              <p>{formatTimestamp(entry.entryTime)}</p>
              <p>{ entry.entryJournal }</p>
              <div className="font-thin text-sm">
                {
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
              </div>
            </div>
          ))
        }
      </div>
      <div className="w-full font-thin font-mono text-sm overflow-y-scroll max-h-[50vh]">
        <pre className="wrap">
          {
            JSON.stringify(allEntries, null, 2)
          }
        </pre>
      </div>
    </div>
  )
}
