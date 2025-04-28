export type SessionType = 'work' | 'break';

export interface IdObject {
    id: string
}

export interface EntryObject {
    id?: string;
    entryTime: string;
    entryName: string;
    entryEfficiency: number;
    entryJournal: string;
    entrySessions?: {sessionIDs: IdObject[]}
  }

export interface SessionObject {
    id?: string;
    sessionIndex: number;
    sessionTime: string;
    sessionDuration: string;
    sessionType: SessionType;
    sessionEntry?: IdObject
}
