import { client } from "./gel";
import { EntryObject } from "./types";
import e from "../../../dbschema/edgeql-js";
import { DateTime } from "luxon";

export async function getAllEntries() {
  const data = await client.query(`select Entry {id, entryTime, entryEfficiency, entryJournal, entryName, sessions}`)
  return data
}

export async function createEntry({entryTime, entryName, entryEfficiency, entryJournal}: EntryObject) {
  // const result = await client.query(`
  //   INSERT INTO default::Entry (entryTime, entryName, entryEfficiency, entryJournal)
  //   VALUES ($1, $2, $3, $4)
  //   RETURNING id, entryTime, entryName, entryEfficiency, entryJournal
  // `, [entryTime, entryName, entryEfficiency, entryJournal]);
  // return result;

  const entryTimeObject = new Date(entryTime)

  // const query = e.insert(e.Entry, {entryTime: entryTimeObject, entryName, entryEfficiency, entryJournal}).unlessConflict()
  // console.log('QUERY --> ', query)
  // const result = await client.querySingle(query)
}

export async function createSessionByEntry(sessionIndex: number, sessionTime: string, sessionDuration: string, sessionType: string, entryID: string) {
  const result = await client.query(`
      INSERT INTO default::Session (sessionIndex, sessionTime, sessionDuration, sessionType, entry)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, sessionIndex, sessionTime, sessionDuration, sessionType, entry
    `, [sessionIndex, sessionTime, sessionDuration, sessionType, entryID])
  return result
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
