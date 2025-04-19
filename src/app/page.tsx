import Image from "next/image";
import { getAllEntries, getSessionByID } from "./lib/db";

export default async function Home() {
  const allEntries = await getAllEntries()
  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full px-10 py-20">
        <p className="text-9xl font-black">superego</p>
      </div>
      <div className="w-full px-10 py-20 text-2xl font-bold flex flex-col gap-20">
        {
          allEntries.map((entry:any) => (
            <div key={entry.id} className="">
              <p>{ entry.entryName }</p>
              <p>Efficiency - { entry.entryEfficiency }</p>
              <p>{JSON.stringify(entry.entryTime)}</p>
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
                              <p>Session Time : { JSON.stringify(sessionEntry.sessionTime) }</p>
                              <p>Session Duration : { JSON.stringify(sessionEntry.sessionDuration) }</p>
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
      <div className="w-full px-10 py-20 font-thin font-mono">
        <pre className="wrap">
          {
            JSON.stringify(allEntries, null, 2)
          }
        </pre>
      </div>
    </div>
  );
}
