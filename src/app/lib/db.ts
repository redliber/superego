import { client } from "./gel";

export async function getAllEntries() {
  const data = await client.query(`select Entry {id, entryTime, entryEfficiency, entryJournal, entryName, sessions}`)
  return data
}

export async function createEntry(
  entryName: string,
  entryEfficiency: number,
  entryJournal?: string
) {
  const result = await client.query(`
    INSERT INTO default::Entry (entryName, entryEfficiency, entryJournal)
    VALUES ($1, $2, $3)
    RETURNING id, entryTime, entryName, entryEfficiency, entryJournal
  `, [entryName, entryEfficiency, entryJournal]);
  return result!.rows[0];
}

export async function getSessionByID(sessionID: string) {
  // console.log('Session ID Received -> ', sessionID)
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
