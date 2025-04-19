import { client } from "./gel";

export async function getAllEntries() {
  const data = await client.query(`select Entry {id, entryTime, entryEfficiency, entryJournal, entryName, sessions}`)
  return data
}

export async function createEntry() {

}

export async function getSessionByID(sessionID: string) {
  console.log('Session ID Received -> ', sessionID)
  const data = await client.query(`select default::Session {
    id,
    sessionTime,
    sessionIndex,
    sessionDuration,
    sessionType
  }
  filter .id = <std::uuid>"${sessionID}"`)
  return data
}
