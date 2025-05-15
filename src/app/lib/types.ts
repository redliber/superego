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

export interface SessionObject extends TentativeSessionObject {
    id?: string;
    sessionTime: Date;
    sessionEntry?: IdObject
}

export interface TentativeSessionObject {
    sessionIndex: number;
    sessionDuration: string;
    sessionType: SessionType;
}

export interface GlobalDefaults {
    defaultWorkDuration: number,
    defaultRestDuration: number,
    defaultSessionAmount: number
}

export interface GlobalSessions {
    tentativeSessions: any[],
    completedSessions: SessionObject[]
}