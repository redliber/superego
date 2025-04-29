export type SessionType = 'work' | 'break';

export interface IdObject {
    id: string
}

export interface EntryObject {
    id?: string;
    entryTime: Date;
    entryName: string;
    entryEfficiency: number;
    entryJournal: string;
    entrySessions?: {sessionIDs: IdObject[]}
  }

export interface SessionObject {
    id?: string;
    sessionIndex: number;
    sessionTime: Date;
    sessionDuration: string;
    sessionType: SessionType;
    sessionEntry?: IdObject
}
